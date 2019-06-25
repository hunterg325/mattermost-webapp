// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Client4} from 'mattermost-redux/client';

import ProfilePicture from 'components/profile_picture.jsx';

const WrapperDiv = styled.div`
    border-radius: 2px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
    font-size: .95em;
    margin: 2em 0 1em;
    padding: 0;
`;

const HeaderDiv = styled.div`
    align-items: flex-start;
    background-color: #295EB9;
    display: flex;
    flex-direction: row;
    padding: 30px 20px 20px 30px;
    height: 92px;
`;

const UserInfo = styled.div`
    color: #fff;
`;

const FirstLastNickname = styled.div`
    font-size: 18px;
    font-weight: normal;
    margin: 0;
    padding: 0;
`;

const AdminUserCard = (props) => (
    <WrapperDiv>
        <HeaderDiv>
            <ProfilePicture
                src={Client4.getProfilePictureUrl(props.userId, props.userLastPictureUpdate)}
                width='134'
                height='134'
                helperClass='admin-user-card'
                userId={props.userId}
            />
            <UserInfo>
                <FirstLastNickname>
                    {props.userFirstLastNickname}
                </FirstLastNickname>
            </UserInfo>
        </HeaderDiv>
        {props.children}
    </WrapperDiv>
);

AdminUserCard.propTypes = {
    children: PropTypes.node,
    userId: PropTypes.string.isRequired,
    userFirstLastNickname: PropTypes.string.isRequired,
    userLastPictureUpdate: PropTypes.number,
};

AdminUserCard.defaultProps = {
    className: '',
};

export default AdminUserCard;
