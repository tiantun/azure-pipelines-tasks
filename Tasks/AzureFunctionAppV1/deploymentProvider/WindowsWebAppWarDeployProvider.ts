import tl = require('azure-pipelines-task-lib/task');
var webCommonUtility = require('azure-pipelines-tasks-azurermdeploycommon/webdeployment-common/utility.js');
import { AzureRmWebAppDeploymentProvider } from './AzureRmWebAppDeploymentProvider';

export class WindowsWebAppWarDeployProvider extends AzureRmWebAppDeploymentProvider {

    private zipDeploymentID: string;

    public async DeployWebAppStep() {

        tl.debug("Initiated deployment via kudu service for webapp war package : "+ this.taskParams.Package.getPath());

        let deploymentMethodtelemetry = '{"deploymentMethod":"War Deploy"}';
        console.log("##vso[telemetry.publish area=TaskDeploymentMethod;feature=AzureWebAppDeployment]" + deploymentMethodtelemetry);

        await this.kuduServiceUtility.warmpUp();

        var warName = webCommonUtility.getFileNameFromPath(this.taskParams.Package.getPath(), ".war");

        this.zipDeploymentID = await this.kuduServiceUtility.deployUsingWarDeploy(this.taskParams.Package.getPath(),
            { slotName: this.appService.getSlot() }, warName);

        await this.PostDeploymentStep();
    }

    public async UpdateDeploymentStatus(isDeploymentSuccess: boolean) {
        if(this.kuduServiceUtility) {
            await super.UpdateDeploymentStatus(isDeploymentSuccess);
            if(this.zipDeploymentID && this.activeDeploymentID && isDeploymentSuccess) {
                await this.kuduServiceUtility.postZipDeployOperation(this.zipDeploymentID, this.activeDeploymentID);
            }
        }
    }
}
