
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import React, { useContext, useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../Redux/store"
import { setShowAttachFiles } from "../../Redux/reducers/utils/utilReducer"
// import { FaMicrophone } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaMicrophone } from "react-icons/fa6";
import { handleSendMessage, handleSetReply, IMessage } from "../../Redux/reducers/msg/MsgReducer";
import { SocketContext } from "../../App";
import useCloseDropDown from "../reuse/CloseDropDown";
import { toggleisRecord } from "../../Redux/reducers/utils/Features";
const MessageBar = () => {
  const dispatch: AppDispatch = useDispatch();
  const socket = useContext(SocketContext);
  const [showEmoji, setShowEmoji] = useCloseDropDown(false, '.emoji-picker-container');

  const { showAttachFiles } = useSelector((store: RootState) => store.utils);
  const { user } = useSelector((store: RootState) => store.auth);
  const { currentUserIndex, friends, replyMessage } = useSelector((state: RootState) => state.msg);
  const [message, setMessage] = useState<string>('');
  const handleEmojiPicker = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setShowEmoji(!showEmoji)
  }
  const handleAddEmoji = (emoji: EmojiClickData) => {
    setMessage(message + ' ' + emoji.emoji)
  }

  const handleSendMsg = () => {
    let conn_type = friends[currentUserIndex].conn_type as "group" | "onetoone"
    // let users = friends[currentUserIndex] && friends[currentUserIndex].users ? friends[currentUserIndex].users : null;

    if (message.trim() !== '' && currentUserIndex !== null && friends[currentUserIndex]) {
      const serializedValues: IMessage = {
        room_id: friends[currentUserIndex].room_id,
        message: message.trim(),
        date: new Date().toISOString(),
        send: false,
        msgType: 'text',
        sender: {
          id: user?._id as string,
          name: user?.name as string,
          mobile: user?.mobile as string
        },
        isMyMsg: true,
        conn_type: conn_type,
        seen: false,
        replyFor: replyMessage ? {
          id: replyMessage._id,
          message: replyMessage.message,
          name: replyMessage.senderName
        } : null
      };

      socket.emit("send_message", serializedValues, (message: any) => {
        dispatch(handleSendMessage(message))
      });
      dispatch(handleSendMessage(serializedValues))
      setMessage('');

      if (replyMessage !== null) {
        dispatch(handleSetReply(null));
      }
    }
  };


  const handleSendMsgFunction = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const handleVoiceMsg = () => {
    dispatch(toggleisRecord(true))
  }
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMsg();
  }
  return (
    <>
      {
        replyMessage && (
          <div className={` bg-nav-bg transition-all ease-in-out duration-150 origin-bottom-right relative  w-full m-auto ${replyMessage !== null ? " scale-y-100  pt-2 " : "scale-y-0 h-0"}`}>
            <div className="bg-[#111b21] mr-[80px]  flex flex-col justify-center px-2 py-1 rounded-lg mx-8 border-l-4 border-green-500">
              <p className="text-[.91rem] text-green-500 line-clamp-1">{replyMessage?.senderName ? replyMessage.senderName : 'You'}</p>
              <p className="text-[.91rem] text-slate-500 line-clamp-1">{replyMessage?.message}</p>
            </div>
            <div onClick={() => dispatch(handleSetReply(null))} className="absolute top-4 right-4 p-2  hover:bg-black rounded-full cursor-pointer">
              <RxCross2 size={25} className="text-white" title="cancel" />
            </div>
          </div>
        )
      }
      <form autoFocus={true} className="w-full" onSubmit={onSubmit}>
        <div className="bg-nav-bg text-white px-2   flex items-center gap-2 sm:gap-6 ">
          <>
            <div className="flex">
              <div className="icons" onClick={handleEmojiPicker}>
                <BsEmojiSmile title="Emoji" id="emoji-open" />
              </div>
              <div className={`emoji-picker-container ${showEmoji ? 'show-emoji-picker w-auto h-auto' : ''}`}>
                <EmojiPicker onEmojiClick={handleAddEmoji} theme={Theme.DARK} />
              </div>

              <div onClick={() => { dispatch(setShowAttachFiles(!showAttachFiles)) }}
                className="icons">
                <ImAttachment title="Attach file" />
              </div>
            </div>
            <div className=" w-full rounded-lg py-2 flex items-center">
              <input type="text" placeholder="Type a message"
                className="bg-[#111b21] text-white w-full font-sans focus:outline-none h-10 px-5 py-4 rounded-lg"
                onChange={handleSendMsgFunction} value={message} />
            </div>
            <div className="flex sm:w-10 items-center justify-center">
              {
                message !== '' ? (
                  <button className="icons" type="submit" >
                    <MdSend title="send" />
                  </button>
                ) : (
                  <button onClick={handleVoiceMsg} type="button" className="icons">
                    <FaMicrophone title="Record" />
                  </button>
                )
              }

            </div>
          </>
        </div>

      </form>

    </>
  );
};

export default React.memo(MessageBar);
