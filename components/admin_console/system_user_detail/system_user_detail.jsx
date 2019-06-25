// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Redirect} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {Overlay, Tooltip} from 'react-bootstrap';

import {isEmail} from 'mattermost-redux/utils/helpers';

import {adminResetMfa, adminResetEmail} from 'actions/admin_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import BlockableLink from 'components/admin_console/blockable_link';
import ResetPasswordModal from 'components/admin_console/reset_password_modal';
import AdminButtonDefault from 'components/admin_console/admin_button_default';
import AdminUserCard from 'components/widgets/admin_console/admin_user_card.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import SaveButton from 'components/save_button.jsx';
import FormError from 'components/form_error.jsx';

const divStyle = {
    padding: '20px 20px 20px 184px',
};

export default class SystemUserDetail extends React.Component {
    static defaultProps = {
        user: {
            email: null,
        },
    }

    static propTypes = {
        user: PropTypes.object.isRequired,
        userId: PropTypes.string.isRequired,
        setNavigationBlocked: PropTypes.bool,
        actions: PropTypes.shape({
            updateUserActive: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            searching: false,
            showPasswordModal: false,
            showDeactivateMemberModal: false,
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
            customComponentWrapperClass: '',
            user: {
                email: this.props.user.email,
            },
        };
    }

    doPasswordReset = (user) => {
        this.setState({
            showPasswordModal: true,
            user,
        });
    }

    doPasswordResetDismiss = () => {
        this.setState({
            showPasswordModal: false,
        });
    }

    doPasswordResetSubmit = () => {
        this.setState({
            showPasswordModal: false,
        });
    }

    handleMakeActive = (e) => {
        e.preventDefault();
        this.props.actions.updateUserActive(this.props.user.id, true).
            then(this.onUpdateActiveResult);
    }

    handleShowDeactivateMemberModal = (e) => {
        e.preventDefault();
        this.setState({showDeactivateMemberModal: true});
    }

    handleDeactivateMember = () => {
        this.props.actions.updateUserActive(this.props.user.id, false).
            then(this.onUpdateActiveResult);
        this.setState({showDeactivateMemberModal: false});
    }

    onUpdateActiveResult = ({error}) => {
        if (error) {
            //this.props.onError({id: error.server_error_id, ...error});
        }
    }

    handleDeactivateCancel = () => {
        this.setState({showDeactivateMemberModal: false});
    }

    // TODO: add error handler function
    handleResetMfa = (e) => {
        e.preventDefault();
        adminResetMfa(this.props.user.id, null, null);
    }

    handleEmailChange = (e) => {
        const emailChange = e.target.value !== this.props.user.email;
        this.setState({
            user: {
                email: e.target.value,
            },
            saveNeeded: emailChange,
        });
        this.props.setNavigationBlocked(true);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.user.email !== this.props.user.email) {
            if (!isEmail(this.state.user.email)) {
                this.setState({serverError: 'Invalid Email address'});
                return;
            }
            const user = Object.assign({}, this.props.user);
            const email = this.state.user.email.trim().toLowerCase();
            user.email = email;

            this.setState({serverError: null});

            adminResetEmail(
                user,
                () => {
                    this.props.history.push('/admin_console/user_management/users');
                },
                (err) => {
                    const serverError = err.message ? err.message : err;
                    this.setState({serverError});
                }
            );

            this.setState({
                saving: false,
                saveNeeded: false,
                serverError: null,
            });
            this.props.setNavigationBlocked(false);
        }
    }

    renderDeactivateMemberModal = (user) => {
        const title = (
            <FormattedMessage
                id='deactivate_member_modal.title'
                defaultMessage='Deactivate {username}'
                values={{
                    username: user.username,
                }}
            />
        );

        let warning;
        if (user.auth_service !== '' && user.auth_service !== Constants.EMAIL_SERVICE) {
            warning = (
                <strong>
                    <br/>
                    <br/>
                    <FormattedMessage
                        id='deactivate_member_modal.sso_warning'
                        defaultMessage='You must also deactivate this user in the SSO provider or they will be reactivated on next login or sync.'
                    />
                </strong>
            );
        }

        const message = (
            <div>
                <FormattedMessage
                    id='deactivate_member_modal.desc'
                    defaultMessage='This action deactivates {username}. They will be logged out and not have access to any teams or channels on this system. Are you sure you want to deactivate {username}?'
                    values={{
                        username: user.username,
                    }}
                />
                {warning}
            </div>
        );

        const confirmButtonClass = 'btn btn-danger';
        const deactivateMemberButton = (
            <FormattedMessage
                id='deactivate_member_modal.deactivate'
                defaultMessage='Deactivate'
            />
        );

        return (
            <ConfirmModal
                show={this.state.showDeactivateMemberModal}
                title={title}
                message={message}
                confirmButtonClass={confirmButtonClass}
                confirmButtonText={deactivateMemberButton}
                onConfirm={this.handleDeactivateMember}
                onCancel={this.handleDeactivateCancel}
            />
        );
    }

    renderActivateDeactivate = () => {
        if (this.props.user.delete_at > 0) {
            return (
                <AdminButtonDefault
                    onClick={this.handleMakeActive}
                    className='admin-btn-default'
                >
                    {Utils.localizeMessage('admin.user_item.makeActive', 'Activate')}
                </AdminButtonDefault>
            );
        }
        return (
            <AdminButtonDefault
                onClick={this.handleShowDeactivateMemberModal}
                className='admin-btn-default'
            >
                {Utils.localizeMessage('admin.user_item.makeInactive', 'Deactivate')}
            </AdminButtonDefault>
        );
    }

    renderRemoveMFA = () => {
        if (this.props.user.mfa_active) {
            return (
                <AdminButtonDefault
                    onClick={this.handleResetMfa}
                    className='admin-btn-default'
                >
                    {'Remove MFA'}
                </AdminButtonDefault>
            );
        }
        return null;
    }

    render() {
        const {user} = this.props;
        let firstLastNickname;
        let position;
        let deactivateMemberModal;
        let currentRoles = (
            <FormattedMessage
                id='admin.user_item.member'
                defaultMessage='Member'
            />
        );

        if (user.id) {
            firstLastNickname = user.first_name + ' ' + user.last_name + ' • ' + user.nickname;
            position = user.position ? user.position : '';
            if (!user.nickname) {
                firstLastNickname = user.first_name + ' ' + user.last_name;
            }
            deactivateMemberModal = this.renderDeactivateMemberModal(user);
            if (user.delete_at > 0) {
                currentRoles = (
                    <FormattedMessage
                        id='admin.user_item.inactive'
                        defaultMessage='Inactive'
                    />
                );
            }
            if (user.roles.length > 0 && Utils.isSystemAdmin(user.roles)) {
                currentRoles = (
                    <FormattedMessage
                        id='team_members_dropdown.systemAdmin'
                        defaultMessage='System Admin'
                    />
                );
            }
        }

        if (!user.id) {
            return (
                <Redirect to={{pathname: '/admin_console/user_management/users'}}/>
            );
        }

        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/users'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.systemUserDetail.title'
                            defaultMessage='User Configuration'
                        />
                    </div>
                </div>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <AdminUserCard
                            userFirstLastNickname={firstLastNickname}
                            userId={user.id}
                            userLastPictureUpdate={user.last_picture_update}
                        >
                            <div style={divStyle}>
                                <h4>{position}</h4>
                                <p><b>{'Email: '}</b></p>
                                <input
                                    type='text'
                                    value={this.state.user.email}
                                    onChange={this.handleEmailChange}
                                />
                                <p><b>{'Username: '}</b>{user.username}</p>
                                <p><b>{'Authentication Method: '}</b>{user.mfa_active ? 'MFA' : 'Email'}</p>
                                <p><b>{'Role: '}</b>{currentRoles}</p>
                                <AdminButtonDefault
                                    onClick={this.doPasswordReset}
                                    className='admin-btn-default'
                                >
                                    {'Reset Password'}
                                </AdminButtonDefault>
                                {this.renderActivateDeactivate()}
                                {this.renderRemoveMFA()}
                            </div>
                        </AdminUserCard>
                    </div>
                </div>
                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={!this.state.saveNeeded || (this.canSave && !this.canSave())}
                        onClick={this.handleSubmit}
                        savingMessage={Utils.localizeMessage('admin.saving', 'Saving Config...')}
                    />
                    <div
                        className='error-message'
                        ref='errorMessage'
                        onMouseOver={this.openTooltip}
                        onMouseOut={this.closeTooltip}
                    >
                        <FormError error={this.state.serverError}/>
                    </div>
                    <Overlay
                        show={this.state.errorTooltip}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        target={this.refs.errorMessage}
                    >
                        <Tooltip id='error-tooltip' >
                            {this.state.serverError}
                        </Tooltip>
                    </Overlay>
                </div>
                <ResetPasswordModal
                    user={user}
                    show={this.state.showPasswordModal}
                    onModalSubmit={this.doPasswordResetSubmit}
                    onModalDismissed={this.doPasswordResetDismiss}
                />
                {deactivateMemberModal}
            </div>
        );
    }
}
