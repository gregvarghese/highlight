import React, { useEffect, useRef, useContext } from 'react';
import { message, Skeleton } from 'antd';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Avatar } from '../../components/Avatar/Avatar';
import { CircularSpinner } from '../../components/Loading/Loading';
import classNames from 'classnames/bind';

import commonStyles from '../../Common.module.scss';
import styles from './WorkspaceTeam.module.scss';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import {
    useGetAdminsQuery,
    useGetOrganizationQuery,
    useSendAdminInviteMutation,
} from '../../graph/generated/hooks';
import Button from '../../components/Button/Button/Button';

type Inputs = {
    email: string;
};

export const WorkspaceTeam = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const emailRef = useRef<null | HTMLInputElement>(null);
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { data: orgData } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });
    const { data, error, loading } = useGetAdminsQuery({
        variables: { organization_id },
    });

    const [
        sendInviteEmail,
        { loading: sendLoading },
    ] = useSendAdminInviteMutation();

    const { setOpenSidebar } = useContext(SidebarContext);

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

    useEffect(() => {
        reset();
    }, [reset]);

    const onSubmit = (data: Inputs) => {
        sendInviteEmail({
            variables: {
                organization_id,
                email: data.email,
            },
        }).then(() => {
            message.success(`Invite email sent to ${data.email}!`, 5);
            reset();
            emailRef.current?.focus();
        });
    };

    if (error) {
        return <div>{JSON.stringify(error)}</div>;
    }

    return (
        <div className={styles.teamPageWrapper}>
            <div className={styles.blankSidebar}></div>
            <div className={styles.teamPage}>
                <div className={styles.title}>Invite A Member</div>
                <div className={styles.subTitle}>
                    Invite a your team to your Workspace.
                </div>
                <div className={styles.box}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.boxTitle}>Invite Your Team</div>
                        <div className={styles.boxSubTitle}>
                            Invite a team member to '
                            {`${orgData?.organization?.name}`}' by entering an
                            email below.
                        </div>
                        <div className={styles.buttonRow}>
                            <input
                                className={commonStyles.input}
                                placeholder={'Email'}
                                type="email"
                                name="email"
                                ref={(e) => {
                                    register(e, { required: true });
                                    emailRef.current = e;
                                }}
                            />
                            <Button
                                type="primary"
                                className={classNames(
                                    commonStyles.submitButton,
                                    styles.inviteButton
                                )}
                            >
                                {sendLoading ? (
                                    <CircularSpinner
                                        style={{ fontSize: 18, color: 'white' }}
                                    />
                                ) : (
                                    'Invite'
                                )}
                            </Button>
                        </div>
                        <div className={commonStyles.errorMessage}>
                            {errors.email &&
                                'Error validating email ' +
                                    errors.email.message}
                        </div>
                    </form>
                </div>
                <div className={styles.box}>
                    <div className={styles.title}>Members</div>
                    {loading ? (
                        <Skeleton />
                    ) : (
                        data?.admins?.map((a) => {
                            return (
                                <div key={a?.id} className={styles.memberCard}>
                                    <Avatar
                                        seed={a?.id.toString() ?? ''}
                                        style={{
                                            height: 45,
                                            width: 45,
                                            marginLeft: 5,
                                            marginRight: 5,
                                        }}
                                    />
                                    <div className={styles.userDetails}>
                                        <div className={styles.name}>
                                            {a?.name}
                                        </div>
                                        <div className={styles.email}>
                                            {a?.email}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
