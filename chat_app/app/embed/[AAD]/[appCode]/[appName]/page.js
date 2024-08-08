"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { BsChatDotsFill } from "react-icons/bs";
import axios from "axios";
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


import ChatList from "@/components/ChatList";

const socket = io("http://localhost:7000");



function MyComponent({ params }) {
  const aad_id = params.AAD;
  const application_code = params.appCode;
  const application_name = params.appName;
  const [showUserList, setShowUserList] = useState(false);
  const [lscode, setLscode] = useState("");
  const [userslist, setUserslist] = useState([]);
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


  // To Know the current user
  useEffect(() => {
    console.log("etrrtt");
    const getData = async () => {
      console.log(aad_id);
      const decodedAadId = atob(aad_id);
      console.log(decodedAadId);
      var apiurl = process.env.NEXT_PUBLIC_API_URL
      const token = await getToken();
      localStorage.setItem("appName", application_name);
      if (token) {
        const response = await axios.get(`${apiurl}/api/chatbot/currentuserdetails`, {
          headers: {
            'Content-Type': 'application/json',
            'AAD': `${aad_id}`,
            'Authorization': `Bearer ${token}`,
            'appName': `${application_name}`,
          },
        })
          .then(({ data }) => {
            const value = data[0];
            localStorage.setItem("userCode", value.usercode);
            localStorage.setItem("UserLscode", value.lscode);
            localStorage.setItem("UserName", value.currentUserName);
            localStorage.setItem("UserEmail", value.currentEmail);
            localStorage.setItem("applicationCode", value.application_code);
            localStorage.setItem("active", value.active);
            setLscode(value.lscode);
          })
          .catch((err) => toast.error('Something went wrong. Please try again.'));
      };

    }
    getData();
  }, [aad_id]);

  const handleClick = async () => {
    var apiurl = process.env.NEXT_PUBLIC_API_URL;
    const token = await getToken();
    var u = localStorage.getItem("userCode");
    console.log(lscode);
    if (token && lscode) {
      const response = await axios.get(`${apiurl}/api/chatbot/getadminuser`, {
        headers: {
          'Content-Type': 'application/json',
          'flag': 0,
          'Appcode': btoa(localStorage.getItem('applicationCode')),
          'usercode': btoa(localStorage.getItem('userCode')),
          'Authorization': `Bearer ${token}`,
          'appName': `${application_name}`
        },
      }).then(({ data }) => {
        setUserslist(data)
        localStorage.setItem("Users", JSON.stringify(data));
      })
        .catch((err) => toast.error('Something went wrong. Please try again.'));
    }
    setShowUserList(!showUserList);

  };

  return (
    <div className="">
      <div onClick={handleClick} draggable className="text-white font-bold rounded bottom-0 right-10 fixed w-20 h-20 flex items-center justify-center overflow-hidden">
        <img loading="lazy" src="/images/chatBotIcon.png" alt="Chat Bot Icon" className="w-full h-full object-cover" />
      </div>
      {showUserList && userslist.length > 0 && (
        <div className="fixed right-14" style={{ bottom: '80px', zIndex: 10 }}>
          <ChatList socket={socket} usrlst={userslist} selectMenu='leapsurge' />
        </div>
      )}
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default MyComponent;


