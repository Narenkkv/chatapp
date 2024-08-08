"use client";
import React, { useEffect, useState } from "react";
import Chat from "./Chat";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const UserCard = ({ imageSrc, user_name, email, score, onClick }) => (
  <div onClick={onClick} className="flex flex-row items-center p-4 mt-2 rounded-xl bg-zinc-950 bg-opacity-50">
    <img
      loading="lazy"
      src={imageSrc}
      alt={`Profile picture of ${user_name}`}
      className="w-8 h-8 mr-4 rounded-full"
    />
    <div className="flex flex-col">
      <p className="text-base font-extralight text-white truncate" style={{ maxWidth: '14rem' }} title={user_name}>
        {user_name}
      </p>
      <p className="text-sm lowercase text-zinc-500 truncate" style={{ maxWidth: '14rem' }} title={email}>
        {email}
      </p>
    </div>
    {score && (
      <div className="ml-auto py-1 px-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
        {score}
      </div>
    )}
  </div>
);

export default function ChatList({
  socket,
  usrlst,
  selectMenu
}) {
  const [showChat, setShowChat] = useState(false);
  const [Joining_room, setJoining_room] = useState("");
  const [Oldmessages, setOldmessages] = useState([]);
  const [chatSenderWithName, setSenderChatWithName] = useState("");
  const [chatSenderWithEmail, setSenderWithEmail] = useState("");
  const [chatWithusercode, setChatWithUsercode] = useState("");
  const [chatWithlscode, setChatWithlscode] = useState("");
  const [userList, setUserList] = useState(usrlst || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(selectMenu);
  const [chatWithUserImage, setChatWithUserImage] = useState("");
  const [joinedUsers, setJoinedUsers] = useState([])

  // Fetch from local storage
  const currentUsername = localStorage.getItem('UserName');
  const currentEmail = localStorage.getItem('UserEmail');
  const app_code = localStorage.getItem('applicationCode');
  const Lscode = localStorage.getItem('UserLscode');
  const user_code = localStorage.getItem('userCode');
  const active = localStorage.getItem('active');
  const appName = localStorage.getItem("appName");

  socket.on("room_users", data => {
    setJoinedUsers(data);
  });



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



  function displayChat(to, from, username, usercode, imageSrc) {

    const namesArray = [from, to];
    const sortedNamesArray = namesArray.sort();
    const joinedNames = sortedNamesArray.join("-");
    setJoining_room(joinedNames);
    setChatWithUsercode(usercode);
    // Leave the previous room and join the new one
    socket.emit('leave_room', { room: joinedNames, userCode: user_code });
    socket.emit("joinroom", { room: joinedNames, userCode: user_code });
    setChatWithUserImage(imageSrc);
    const getList = async () => {
      const encodedChatId = btoa(joinedNames);
      var apiurl = process.env.NEXT_PUBLIC_API_URL
      var url = `${apiurl}/api/chatbot/getchat`
      const token = await getToken();
      console.log("chatopen");
      console.log(token);
      if (token) {
        try {
          const { data } = await axios.get(`${url}`, {
            headers: {
              "Content-Type": "application/json",
              "userCode": btoa(localStorage.getItem('userCode')),
              "chatid": `${encodedChatId}`,
              'Authorization': `Bearer ${token}`,
              'appName': appName
            },
          });
          socket.emit("update_messages", { room: joinedNames, messages: data });
        } catch (err) {
          console.log(err);
          toast.error('Something went wrong. Please try again.');
        }
      };

    }
    getList();
    localStorage.setItem("room", joinedNames);
    setSenderChatWithName(username);
    setSenderWithEmail(to);
    socket.on("update_messages", (data) => {
      if (data.room === joinedNames) {
        setOldmessages(data.messages);
      }
    });
    setShowChat(true);
  }

  async function displayUser(lscode) {
    var apiurl = process.env.NEXT_PUBLIC_API_URL
    var url = `${apiurl}/api/chatbot/getcustomeruser`
    const token = await getToken();
    if (token) {
      try {
        setChatWithlscode(lscode);
        const response = await axios.get(`${url}`, {
          headers: {
            'Content-Type': 'application/json',
            'usercode': btoa(localStorage.getItem('userCode')),
            'lscode': btoa(`${lscode}`),
            'Authorization': `Bearer ${token}`,
            'appName': appName
          },
        });
        setUserList(response.data);
        localStorage.setItem("Users", JSON.stringify(response.data));
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
        console.error('Error fetching company details:', error);
      }
    }
  }

  const fetchCompanyDetails = async () => {
    var apiurl = process.env.NEXT_PUBLIC_API_URL
    setLoading(true);
    setError(null);
    setSelected('company');
    const token = await getToken();
    if (token) {
      try {
        const response = await axios.get(`${apiurl}/api/chatbot/getadminuser`, {
          headers: {
            'Content-Type': 'application/json',
            'flag': 1,
            'usercode': btoa(localStorage.getItem('userCode')),
            'Appcode': btoa(localStorage.getItem('applicationCode')),
            // 'email': currentEmail,
            'Authorization': `Bearer ${token}`,
            'appName': appName
          },
        });
        setUserList(response.data);
        localStorage.setItem("Users", JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching company details:', error);
        setError('Failed to fetch company details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchLeapsurgeDetails = async () => {
    var apiurl = process.env.NEXT_PUBLIC_API_URL
    var url = `${apiurl}/api/chatbot/getadminuser`
    setLoading(true);
    setError(null);
    setSelected('leapsurge');
    const token = await getToken();
    console.log("jjj");
    console.log(app_code);
    console.log(user_code);
    if (token) {
      try {
        const response = await axios.get(`${url}`, {
          headers: {
            'Content-Type': 'application/json',
            'flag': 0,
            'Appcode': btoa(app_code),
            'usercode': btoa(user_code),
            // 'email': currentEmail,
            'Authorization': `Bearer ${token}`,
            'appName': appName
          },
        });
        setUserList(response.data);
        localStorage.setItem("Users", JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching Leapsurge details:', error);
        setError('Failed to fetch Leapsurge details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-start rounded-3xl w-[340px] h-[420px] pb-10 right-10 bg-gray-800">
      {!showChat ? (
        <main className="flex flex-col w-[340px] h-[420px] rounded-3xl border-indigo-400 border-solid p-4 border-[3px]">
          <header className="flex gap-2 text-base font-semibold justify-evenly text-center whitespace-nowrap flex-wrap">
            <img
              loading="lazy"
              src="/images/chatBotIcon.png"
              alt=""
              className="shrink-0 my-auto aspect-square w-[50px]"
            />
            <div className="flex gap-2 bg-white rounded-xl flex-wrap max-w-full">
              <div onClick={!loading ? fetchLeapsurgeDetails : null} className={`flex-auto justify-center p-3 text-black rounded-md ${selected === 'leapsurge' ? 'bg-[linear-gradient(207deg,#727CF5_22.46%,#43488F_93.12%)]' : 'bg-white text-black'}`} style={{ pointerEvents: loading ? 'none' : 'auto', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading && selected === 'leapsurge' ? 'Loading...' : 'Leapsurge'}
              </div>
              <div onClick={!loading ? fetchCompanyDetails : null} className={`flex-auto justify-center p-3 text-black rounded-md ${selected === 'company' ? 'bg-[linear-gradient(207deg,#727CF5_22.46%,#43488F_93.12%)]' : 'bg-white text-black'}`} style={{ pointerEvents: loading ? 'none' : 'auto', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading && selected === 'company' ? 'Loading...' : 'Company'}
              </div>
              {error && <div style={{ color: 'red' }}>{error}</div>}
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c15778a56f90077abc382e8f47af03f99d3059528b7fc228c8c0ef1a40715697?apiKey=d0edcf51e7af4a84a6aee3a232edac89&"
              alt=""
              className="shrink-0 self-start aspect-square w-[35px] hidden"
            />
          </header>

          <section className="mt-4 max-h-full max-w-full overflow-y-auto hide-scrollbar" style={{ pointerEvents: loading ? 'none' : 'auto', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {userList && userList.length > 0 &&
              userList.map((user, index) => {
                if (user.flag == 0 && user.email !== currentEmail) {
                  return (
                    <UserCard
                      key={index}
                      imageSrc={user.image ? user.image : '/images/defaultUser.png'}
                      user_name={user.name}
                      email={user.email}
                      score={user.chatcount !== 0 ? user.chatcount : ""}
                      currentUsername={currentUsername}
                      onClick={() =>
                        displayChat(user.email, currentEmail, user.name, user.usercode, user.image ? user.image : '/images/defaultUser.png')
                      }
                    />
                  );
                } else if (user.flag == 1) {
                  return (
                    <UserCard
                      key={index}
                      imageSrc={user.image ? user.image : '/images/defaultUser.png'}
                      user_name={user.name}
                      email={user.email}
                      score={user.score}
                      currentUsername={currentUsername}
                      onClick={() => displayUser(user.lscode)}
                    />
                  );
                }
                return null;
              })
            }
          </section>
          <ToastContainer position="bottom-center" />
        </main>
      ) : (
        <Chat
          socket={socket}
          chatWithName={chatSenderWithName}
          chatWithusercode={chatWithusercode}
          roomname={Joining_room}
          oldmessages={Oldmessages}
          chatWithEmail={chatSenderWithEmail}
          chatWithUserImage={chatWithUserImage}
          selectMenu={selected}
          joinedUsers={joinedUsers}
          chatWithlscode={chatWithlscode}
        />
      )}
    </div>
  );
}
