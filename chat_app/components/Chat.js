import React, { useEffect, useState, KeyboardEvent, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";
import { format, addMinutes } from 'date-fns';
import ChatList from "@/components/ChatList";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const ChatMessage = ({ content, time, isUser, seen }) => (

  <div className={`flex flex-col ${isUser ? "self-end" : "self-start"} ${isUser ? "mr-2" : "ml-2"} mt-3`}>
    <div className={`inline-block max-w-[250px] p-1 text-sm text-white rounded ${isUser ? "bg-indigo-400" : "bg-zinc-950 bg-opacity-50"}`}>
      <div className="whitespace-pre-line break-words">
        {content}
      </div>
    </div>
    <div className={`mt-1 text-xs text-neutral-400 ${isUser ? "self-end" : "self-start"}`}>
      {time}{(isUser && seen == 2)
        ? " ✓✓"
        : (isUser && seen != 2)
          ? " ✓"
          : (!isUser)
            ? "  "
            : ""}
    </div>
  </div>
);



const UserProfile = ({ name, email, avatarSrc, onClick }) => (
  <div className="flex justify-between items-center p-4 h-20 bg-white rounded-xl max-w-md">
    <div className="flex items-center gap-6">
      <img
        loading="lazy"
        onClick={onClick}
        src="/images/backBtn.png"
        alt="Back Button"
        className="w-6 h-6 cursor-pointer"
      />
      <img
        loading="lazy"
        src={avatarSrc}
        alt={`${name}'s avatar`}
        className="w-16 h-16 rounded-full shadow-sm"
      />
    </div>
    <div className="flex flex-col">
      <div className="text-base font-semibold text-indigo-400">{name}</div>
      <div className="text-sm text-gray-500">{email}</div>
    </div>
  </div>

);

export default function ChatInterface({
  socket,
  chatWithName,
  chatWithusercode,
  roomname,
  oldmessages,
  chatWithEmail,
  chatWithUserImage,
  selectMenu,
  joinedUsers,
  chatWithlscode
}) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const uniq_key = Math.floor(Math.random() * 50);
  const socket_id = socket.id;
  const username = localStorage.getItem('UserName');
  const app_code = localStorage.getItem('applicationCode');
  const userslist = JSON.parse(localStorage.getItem('Users') || '[]');
  const ls_code = localStorage.getItem('UserLscode');
  const user_code = localStorage.getItem('userCode');
  const scrollRef = useRef(null);
  const isMessageProcessedRef = useRef(new Set());
  let roomUsers = {}; // Object to store users in each room
  let combinedMessage = [...(oldmessages || []), ...messageList];
  const [combinedMessages, setCombinedMessages] = useState(combinedMessage);
  const appName = localStorage.getItem("appName");

  // Access token 
  const getToken = async () => {
    const tokenurl = process.env.NEXT_PUBLIC_TOKEN_URL;
    const tokendata = {
      username: process.env.NEXT_PUBLIC_TOKEN_USERNAME,
      password: process.env.NEXT_PUBLIC_TOKEN_PASSWORD,
    };

    try {
      const response = await axios.post(`${tokenurl}`, tokendata, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.access_token;
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong. Please try again.');
      return '';
    }
  };



  const handleImgClick = async () => {
    const token = await getToken();
    if (token) {
      if (selectMenu == 'leapsurge') {
        try {
          var apiurl = process.env.NEXT_PUBLIC_API_URL
          const response = await axios.get(`${apiurl}/api/chatbot/getadminuser`, {
            headers: {
              'Content-Type': 'application/json',
              'flag': 0,
              'Appcode': btoa(localStorage.getItem('applicationCode')),
              'usercode': btoa(localStorage.getItem('userCode')),
              'email': btoa(localStorage.getItem('UserEmail')),
              'Authorization': `Bearer ${token}`,
              'appName': appName
            },
          });
          localStorage.setItem("Users", JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching Leapsurge details:', error);
          setError('Failed to fetch Leapsurge details. Please try again.');
        }
      }
      if (selectMenu == 'company') {
        try {
          var apiurl = process.env.NEXT_PUBLIC_API_URL
          const response = await axios.get(`${apiurl}/api/chatbot/getcustomeruser`, {
            headers: {
              'Content-Type': 'application/json',
              'usercode': btoa(localStorage.getItem('userCode')),
              'email': btoa(localStorage.getItem('UserEmail')),
              'lscode': btoa(`${chatWithlscode}`),
              'Authorization': `Bearer ${token}`,
              'appName': appName
            },
          });
          localStorage.setItem("Users", JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching company details:', error);
        }
      }
      setShowUserList(true);
      socket.emit('leave_room', { room: roomname, userCode: user_code });
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      setCurrentMessage("");
      const isSeen = joinedUsers[roomname]?.includes(chatWithusercode) || false;
      const data = {
        application_code: app_code,
        LSCode: ls_code,
        from_user_code: user_code,
        to_user_code: chatWithusercode,
        chat_id: roomname,
        Message: currentMessage,
        Status: isSeen ? 2 : 1,
        name: username,
      };
      try {
        var apiurl = process.env.NEXT_PUBLIC_API_URL
        const token = await getToken();
        if (token) {
          const response = await axios.post(`${apiurl}/api/chatbot/insertchatdetails`, data, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'appName': appName
            },
            method: 'POST',
          });

          // const dataa = response.data
          if (isMessageProcessedRef.current.has(response.data.message_id)) {
            return;
          }
          isMessageProcessedRef.current.add(response.data.message_id);
          setCombinedMessages((messages) => [...messages, response.data]);
          console.log("selectMenu");
          console.log(selectMenu);
          if (selectMenu == 'leapsurge') {
            var apiurl = process.env.NEXT_PUBLIC_API_URL
            try {
              const response = await axios.get(`${apiurl}/api/chatbot/getadminuser`, {
                headers: {
                  'Content-Type': 'application/json',
                  'flag': '0',
                  'Appcode': btoa(localStorage.getItem('applicationCode')),
                  'usercode': btoa(localStorage.getItem('userCode')),
                  'email': btoa(localStorage.getItem('UserEmail')),
                  'Authorization': `Bearer ${token}`,
                  'appName': appName
                },
              });

              localStorage.setItem("Users", JSON.stringify(response.data));
            } catch (error) {
              console.error('Error fetching Leapsurge details:', error);
              setError('Failed to fetch Leapsurge details. Please try again.');
            }

          }
          if (selectMenu == 'company') {
            var apiurl = process.env.NEXT_PUBLIC_API_URL
            try {
              const response = await axios.get(`${apiurl}/api/chatbot/getcustomeruser`, {
                headers: {
                  'Content-Type': 'application/json',
                  'usercode': btoa(localStorage.getItem('userCode')),
                  'email': btoa(localStorage.getItem('UserEmail')),
                  'lscode': btoa(`${chatWithlscode}`),
                  'Authorization': `Bearer ${token}`,
                  'appName': appName
                },
              });
              localStorage.setItem("Users", JSON.stringify(response.data));
            } catch (error) {
              console.error('Error fetching company details:', error);
            }

          }
          socket.emit("private message", response.data);
        }
      } catch (err) {
        toast.error('Something went wrong. Please try again.');
        console.error(err);
      }
    }
  };


  useEffect(() => {
    const handlePrivateMessage = async (data) => {
      if (!isMessageProcessedRef.current.has(data.message_id)) {
        isMessageProcessedRef.current.add(data.message_id);
        setCombinedMessages((messages) => [...messages, data]);
        socket.emit("private message", data);
      }
    };

    socket.on("private_message", handlePrivateMessage);
    return () => {
      socket.off("private_message", handlePrivateMessage);
    };
  }, [socket]);



  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };


  useEffect(() => {
    // This effect will run every time combinedMessages changes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combinedMessages]);

  useEffect(() => {
    setCombinedMessages([])
    setCombinedMessages([...oldmessages])
  }, [oldmessages]);

  return (
    <div>
      {!showUserList ? (
        <main className="flex flex-col justify-between items-center pb-6 right-10 rounded-xl mb-28 border border-white  w-[340px] h-[420px]">
          <header className="flex flex-col self-center w-full text-center max-md:max-w-full">
            <UserProfile
              name={chatWithName}
              email={chatWithEmail}
              onClick={handleImgClick}
              avatarSrc={chatWithUserImage}
            />
          </header>

          {/* Add section header */}
          <header className="flex flex-col items-center w-full text-center bg-gray-700 p-2">
            <h1 className="text-xl font-semibold text-white">Chat Section</h1>
          </header>

          <section className="m-4 h-[200px] w-[300px] mr-4">
            <div ref={scrollRef} className="max-h-full overflow-y-auto hide-scrollbar">
              {combinedMessages && combinedMessages.length > 0 ? (
                combinedMessages.map((messageContent) => (
                  <div key={messageContent.message_id}>
                    {username !== messageContent.name ? (
                      <div className="flex flex-col self-start">
                        <ChatMessage
                          content={messageContent.Message}
                          time={format(addMinutes(new Date(messageContent["Date of Creation"]), 330), 'hh:mm a')}
                          isUser={false}
                          seen={messageContent.Status}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col self-end">
                        <ChatMessage
                          content={messageContent.Message}
                          time={format(addMinutes(new Date(messageContent["Date of Creation"]), 330), 'hh:mm a')}
                          isUser={true}
                          seen={messageContent.Status}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No messages to display</p>
              )}
            </div>
          </section>

          {/* Add centered footer section */}
          <footer className="flex justify-center items-center gap-2 px-4 py-2 mb-3 text-center bg-white rounded-xl text-zinc-500 w-10/12">
            <label htmlFor="chatInput" className="sr-only">Type your message</label>
            <input
              id="chatInput"
              type="text"
              placeholder="Type Here"
              value={currentMessage}
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={handleKeyPress}
              className="my-auto bg-transparent border-none outline-none flex-grow"
            />
            <button type="button" aria-label="Send message" onClick={sendMessage}>
              <img
                loading="lazy"
                src="/images/sendIcon.png"
                alt=""
                className="shrink-0 aspect-square w-[30px]"
              />
            </button>
          </footer>
          <ToastContainer position="bottom-center" />
        </main>
      ) : (
        <ChatList
          socket={socket}
          currentusername={username}
          currentEmail=""
          usrlst={JSON.parse(localStorage.getItem('Users') || '[]')}
          app_code={app_code}
          Lscode={ls_code}
          user_code={user_code}
          selectMenu={selectMenu}
        />
      )}
    </div>
  );
}
