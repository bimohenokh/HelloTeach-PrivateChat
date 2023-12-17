import { useState, useEffect, useRef } from 'react';
import {useParams} from "react-router-dom";
import SendbirdChat from '@sendbird/chat';
import {
    GroupChannelModule,
    GroupChannelFilter,
    MessageFilter,
    MessageCollectionInitPolicy
} from '@sendbird/chat/groupChannel';

import { SENDBIRD_INFO } from '../constants/constants';
import { timestampToTime, handleEnterPress } from '../utils/messageUtils';
let sb;

const PrivateChat = (props) => {

    const [state, updateState] = useState({
        currentlyJoinedChannel: null,
        messages: [],
        channels: [],
        messageInputValue: "",
        userNameCurrent: "",
        userIdCurrent: "",
        settingUpUser: true,
        messageCollection: null,
        loading: false,
        error: false
    });

    const {idUserParam} = useParams();

    //need to access state in message received callback
    const stateRef = useRef();
    stateRef.current = state;

    const channelRef = useRef();

    const messageHandlers = {
        onMessagesAdded: (context, channel, messages) => {
            const updatedMessages = [...stateRef.current.messages, ...messages];

            updateState({ ...stateRef.current, messages: updatedMessages });

        },
        onMessagesDeleted: (context, channel, messageIds) => {
            const updateMessages = stateRef.current.messages.filter((message) => {
                return !messageIds.includes(message.messageId);
            });
            updateState({ ...stateRef.current, messages: updateMessages });

        },
    }

    const scrollToBottom = (item, smooth) => {
        item?.scrollTo({
            top: item.scrollHeight,
            behavior: smooth
        })
    }

    useEffect(() => {
        scrollToBottom(channelRef.current)
    }, [state.currentlyJoinedChannel])

    useEffect(() => {
        scrollToBottom(channelRef.current, 'smooth')
    }, [state.messages])

    const onError = (error) => {
        updateState({ ...state, error: error.message });
        console.log(error);
    }

    const handleJoinChannel = async (channelUrl) => {
        if (state.messageCollection && state.messageCollection.dispose) {
            state.messageCollection?.dispose();
        }

        if (state.currentlyJoinedChannel?.url === channelUrl) {
            return null;
        }
        const { channels } = state;
        updateState({ ...state, loading: true });
        const channel = channels.find((channel) => channel.url === channelUrl);
        const onCacheResult = (err, messages) => {
            updateState({ ...stateRef.current, currentlyJoinedChannel: channel, messages: messages.reverse(), loading: false })

        }

        const onApiResult = (err, messages) => {
            updateState({ ...stateRef.current, currentlyJoinedChannel: channel, messages: messages.reverse(), loading: false })
        }

        const collection = loadMessages(channel, messageHandlers, onCacheResult, onApiResult);

        updateState({ ...state, messageCollection: collection });
    }

    const handleDeleteChannel = async () => {
        const { currentlyJoinedChannel } = state;
        await currentlyJoinedChannel.remove();

        updateState({ ...state, currentlyJoinedChannel: null })
    }

    const onMessageInputChange = (e) => {
        const messageInputValue = e.currentTarget.value;
        updateState({ ...state, messageInputValue });
    }

    const sendMessage = async () => {
        const {currentlyJoinedChannel } = state;

        const userMessageParams = {};
        userMessageParams.message = state.messageInputValue
        currentlyJoinedChannel.sendUserMessage(userMessageParams)
            .onSucceeded((message) => {

                updateState({ ...stateRef.current, messageInputValue: "" });
            })
            .onFailed((error) => {
                console.log(error)
                console.log("failed")
            });

    }

    const handleDeleteMessage = async (messageToDelete) => {
        const { currentlyJoinedChannel } = state;
        await deleteMessage(currentlyJoinedChannel, messageToDelete); // Delete
    }

    const updateMessage = async (message) => {
        updateState({ ...state, messageToUpdate: message, messageInputValue: message.message });
    }

    const setupUser = async () => {

        const userIdCurrent = idUserParam;

        const sendbirdChat = await SendbirdChat.init({
            appId: SENDBIRD_INFO.appId,
            localCacheEnabled: true,
            modules: [new GroupChannelModule()]
        });

        await sendbirdChat.connect(userIdCurrent);

        sb = sendbirdChat;
        updateState({ ...state, loading: true });
        const [channels, error] = await loadChannels();
        if (error) {
            return onError(error);
        }

        updateState({ ...state,
            userIdCurrent: userIdCurrent,
            channels: channels,
            loading: false,
            settingUpUser: false
        });
    }

    if (state.loading) {
        return <div>Loading...</div>
    }

    if (state.error) {
        return <div className="error">{state.error} check console for more information.</div>
    }

    console.log('- - - - State object very useful for debugging - - - -');
    console.log(state);

    return (
        <>
            <SetupPage
                setupUser={setupUser}
                settingUpUser={state.settingUpUser}
            />
            <ChannelList
                channels={state.channels}
                handleJoinChannel={handleJoinChannel}
            />
            <Channel
                currentlyJoinedChannel={state.currentlyJoinedChannel}
                handleDeleteChannel={handleDeleteChannel}
                channelRef={channelRef}
            >
                <MessagesList
                    messages={state.messages}
                    handleDeleteMessage={handleDeleteMessage}
                    updateMessage={updateMessage}
                />
                <MessageInput
                    value={state.messageInputValue}
                    onChange={onMessageInputChange}
                    sendMessage={sendMessage}
                />
            </Channel>
            <MembersList
                channel={state.currentlyJoinedChannel}
            />
        </>
    );
};

// Chat UI Components
const ChannelList = ({
    channels,
    handleJoinChannel,
}) => {
    return (
        <div className='channel-list'>
            <div className="channel-type">
                <h1>Group Channels</h1>
            </div>
            {channels.map(channel => {
                return (
                    <div key={channel.url} className="channel-list-item" >
                        <div
                            className="channel-list-item-name"
                            onClick={() => { handleJoinChannel(channel.url) }}>
                            <ChannelName members={channel.members} />
                            <div className="last-message">{channel.lastMessage?.message}</div>
                        </div>
                    </div>
                );
            })}
        </div >);
}

const ChannelName = ({ members }) => {
    const membersToDisplay = members.slice(0, 2);
    const membersNotToDisplay = members.slice(2);

    return <>
        {membersToDisplay.map((member) => {
            return <span key={member.userId}>{member.nickname}</span>
        })}
        {membersNotToDisplay.length > 0 && `+ ${membersNotToDisplay.length}`}
    </>
}

const Channel = ({ currentlyJoinedChannel, children, handleDeleteChannel, channelRef }) => {
    if (currentlyJoinedChannel) {
        return <div className="channel" ref={channelRef}>
            <ChannelHeader>{currentlyJoinedChannel.name}</ChannelHeader>
            <div>
                <button className="leave-channel" onClick={handleDeleteChannel}>Leave Channel</button>
            </div>
            <div>{children}</div>
        </div>;
    }
    return <div className="channel"></div>;
}

const ChannelHeader = ({ children }) => {
    return <div className="channel-header">{children}</div>;
}

const MembersList = ({ channel }) => {
    if (channel) {
        return <div className="members-list">
            {channel.members.map((member) =>
                <div className="member-item" key={member.userId}>{member.nickname}</div>
            )}
        </div>;
    } else {
        return null;
    }
}

const MessagesList = ({ messages, handleDeleteMessage, updateMessage }) => {
    return <div className="message-list">
        {messages.map(message => {
            if (!message.sender) return null;
            const messageSentByYou = message.sender.userId === sb.currentUser.userId;
            return (
                <div key={message.messageId} className={`message-item ${messageSentByYou ? 'message-from-you' : ''}`}>
                    <Message
                        message={message}
                        handleDeleteMessage={handleDeleteMessage}
                        messageSentByYou={messageSentByYou} />
                    <ProfileImage user={message.sender} />
                </div>
            );
        })}
    </div>
}

const Message = ({ message, handleDeleteMessage, messageSentByYou }) => {
    if (message.url) {
        return (
            <div className={`message  ${messageSentByYou ? 'message-from-you' : ''}`}>
                <div className="message-user-info">
                    <div className="message-sender-name">{message.sender.nickname}{' '}</div>
                    <div>{timestampToTime(message.createdAt)}</div>
                </div>
                <img src={message.url}  alt={""}/>
            </div >);
    }
    const messageSentByCurrentUser = message.sender.userId === sb.currentUser.userId;

    return (
        <div className={`message  ${messageSentByYou ? 'message-from-you' : ''}`}>
            <div className="message-info">
                <div className="message-user-info">
                    <div className="message-sender-name">{message.sender.nickname}{' '}</div>
                    <div>{timestampToTime(message.createdAt)}</div>
                </div>
                {messageSentByCurrentUser &&
                    <div>
                        <button className="control-button" onClick={() => handleDeleteMessage(message)}><img className="message-icon" src='/icon_delete.png'  alt={""}/></button>
                    </div>}
            </div>
            <div>{message.message}</div>
        </div>
    );
}

const ProfileImage = ({ user }) => {
    if (user.plainProfileUrl) {
        return <img className="profile-image" src={user.plainProfileUrl}  alt={""}/>
    } else {
        return <div className="profile-image-fallback">{user.nickname.charAt(0)}</div>;
    }
}

const MessageInput = ({
                      value,
                      onChange,
                      sendMessage,
}) => {
    return (
        <div className="message-input">
            <input
                placeholder="write a message"
                value={value}
                onChange={onChange}
                onKeyDown={(event => handleEnterPress(event, sendMessage))}
            />
            <div className="message-input-buttons">
                <button className="send-message-button" onClick={sendMessage}>Send Message</button>
            </div>
        </div>
    );
}

const SetupPage = ({
    setupUser,
    settingUpUser,

}) => {
    if (settingUpUser) {
        return <div className="overlay">
            <div className="overlay-content" onKeyDown={(event) => handleEnterPress(event, setupUser)}>
                <button
                    className="user-submit-button"
                    onClick={setupUser}
                >
                    Connect
                </button>
            </div>
        </div>
    } else {
        return null;
    }
}

// Helpful functions that call Sendbird
const loadChannels = async () => {
    const groupChannelFilter = new GroupChannelFilter();
    groupChannelFilter.includeEmpty = true;

    const query = sb.groupChannel.createMyGroupChannelListQuery({
        includeEmpty: true,
        customTypeStartsWithFilter: 'open',
        userIdsIncludeFilter: [sb.currentUser.userId],
    });
    const channels = await query.next();
    return [channels, null];
}

const loadMessages = (channel, messageHandlers, onCacheResult, onApiResult) => {
    const messageFilter = new MessageFilter();

    const collection = channel.createMessageCollection({
        filter: messageFilter,
        startingPoint: Date.now(),
        limit: 100
    });

    collection.setMessageCollectionHandler(messageHandlers);
    collection
        .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
        .onCacheResult(onCacheResult)
        .onApiResult(onApiResult);
    return collection;
}

const deleteMessage = async (currentlyJoinedChannel, messageToDelete) => {
    await currentlyJoinedChannel.deleteMessage(messageToDelete);
}

export default PrivateChat
