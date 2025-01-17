import { ACTIONS_RECORDING_STATE } from "./actionsRecordingState";
import { ACTIONS_MODAL_STATE } from "./actionsModalState";
import { iSeoMetaInformationMeta } from "../messageListener";
import { iElementInfo } from "@shared/types/elementInfo";
import { iExecuteScriptOutputResponseMeta } from "../scripts/inject/responseMessageListener";

export interface iRecorderState {
	isInspectModeOn: boolean;
	actionsRecordingState: {
		type: ACTIONS_RECORDING_STATE;
		elementInfo?: iElementInfo | null;
	};
	isAutoRecordOn: boolean;
	isRecorderScriptBooted: boolean;
	modalState: ACTIONS_MODAL_STATE | null;
	seoMetaInfo: iSeoMetaInformationMeta | null;
	lastElementExecutionScriptOutput: iExecuteScriptOutputResponseMeta | null;
}
