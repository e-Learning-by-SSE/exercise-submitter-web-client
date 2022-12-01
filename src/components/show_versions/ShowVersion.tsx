import React from "react";

import {Segment, Dimmer, Loader} from "semantic-ui-react";
import { ShowVersionState } from "../../constants/ShowVersion";
import AssignmentPortal from "../../portals/AssignmentPortal";
import { AssignmentDto } from "stumgmtbackend";
import DataService from "../../services/DataService";
import VersionTable from "./VersionTable";
import { VersionDto } from "exerciseserverclientlib";
import { ShowVersionStack } from "../../stacks/ShowVersionStack";
import Stack from "../../stacks/Stack";
import DownloadSubmissionModal from "./DownloadSubmissionModal";

export default class ShowVersion extends React.Component<React.PropsWithChildren<{}>, {table: any, showVersionState: string, assignments: AssignmentDto[], showModal: any }> {
    
        private selectedAssignment: AssignmentDto | null = null;;

        constructor(props: React.PropsWithChildren<{}>) {
            super(props);
            this.state = {table:  
                
                  <Loader active inline='centered' />
                
              ,showModal: null
              ,showVersionState: ShowVersionState.LOADING, assignments: []};

        }

        handleAssignmentWindowClosed = (e: AssignmentDto) => {
            if(e != null) {
                this.loadVersionAndDrawTable(e);
            }
        }

        handleDownloadSubmission = (version: VersionDto, creatingDownloadComplete: () => void) =>  {
            let api = new DataService();
            let client = api.getSubmissisonClient();
            if(this.selectedAssignment != null) {
                let assignment = this.selectedAssignment;
                    api.getGroupName(this.selectedAssignment).then((groupname) => {
                    client.downloadSubmission(assignment.name,groupname,version.timestamp).then((submission) => {                      
                        creatingDownloadComplete();
                        this.setState({showModal: <DownloadSubmissionModal onClosed={() => {}} files={submission}
                        group={groupname} version={version} />});
                    });

                });

            }
        }
        
        private loadVersionAndDrawTable(assignment: AssignmentDto) {
            this.selectedAssignment = assignment;
            let api = new DataService();
            let client = api.getSubmissisonClient();
            api.getGroupName(assignment).then((groupname) => {
                client.getVersionsOfAssignment(assignment.name,groupname).then((versions) => {
                    this.setState({table: <VersionTable versions={versions} onClickDownloadButton={this.handleDownloadSubmission}/>});
                    this.setState({showVersionState: ShowVersionState.DRAWTABLE});
                });
            });
           
            

        }

        private loadAssignments() {

            let api = new DataService();
            let stumgmt = api.getStumgmtbackend();
            stumgmt.getAssigments().then((assignments ) => {
                this.setState({assignments: assignments});
                this.setState({showVersionState: ShowVersionState.SELECTASSIGNMENT});
            });
        }


        render(): React.ReactNode {
            if(this.state.showVersionState == ShowVersionState.LOADING) {
                this.loadAssignments();
            }


            return (
                <div className="show-version">
                  {this.state.table}
                    {this.state.showVersionState == ShowVersionState.SELECTASSIGNMENT ? <AssignmentPortal assignments={this.state.assignments}
                    onReady={this.handleAssignmentWindowClosed}/> : null } 
                    {this.state.showModal}
                    {this.state.showVersionState != ShowVersionState.LOADING ?
                    <Stack stack={ShowVersionStack} selected={this.state.showVersionState} /> : null}
                </div>
            );
        }
    }

   