import { header, menu } from "./home.js";
import { urlHandler } from "../scripts/routes.js";
import { fetchProfile, globalState, sendRealTimeNotification } from '../scripts/fetchData.js';
import { createTicTacToeMatch } from './tictactoe/fetch.js'
import { handleUnfriend } from './search.js'

const data = {
  Socket: null,
  friend: null,
  Roomname: null,
};

export async function ChatComponent() {
  if (!globalState.user) await fetchProfile();
  if (globalState.user === null) {
    return `cant fetch user data`;
  }

  return header() + menu() + chatContent();
}

function sendLoginStatus(message, UserId) {
  if (data.Socket && data.Socket.readyState === WebSocket.OPEN) {
    data.Socket.send(
      JSON.stringify({
        user_id: UserId,
        message: message,
      })
    );
  }
}

async function sendInvitation()
{
    const match_key = await createTicTacToeMatch()
    history.pushState(null, null, `/tictactoe_board?match_key=${match_key}`);
    urlHandler();
    sendRealTimeNotification('game_request', {sender: globalState.user.username, receiver: data.friend.username, key: match_key});
}

function addMessage(message, sender) {
  const chatBox = document.getElementById("chat-content");

  // Créer un nouvel élément div pour le message
  const messageDiv = document.createElement("div");

  // Ajouter la classe 'right' ou 'left' selon l'expéditeur
  if (sender === "user") {
    messageDiv.classList.add("right");
    messageDiv.style.backgroundColor = "#36aaa7";
    messageDiv.style.fontFamily = "monospace";
    messageDiv.style.fontSize = "13px";
  } else {
    messageDiv.classList.add("left");
    messageDiv.style.backgroundColor = "#468383";
    messageDiv.style.fontFamily = "monospace";
    messageDiv.style.fontSize = "13px";
  }

  // Créer un élément p pour le texte du message et l'ajouter au div
  const messageText = document.createElement("p");
  messageText.textContent = message;
  messageDiv.appendChild(messageText);

  // Ajouter le message au chat
  chatBox.appendChild(messageDiv);

  // Faire défiler la boîte de chat vers le bas
  chatBox.scrollTop = chatBox.scrollHeight;
}

function new_message() {
  const messageInput = document.getElementById("input-box");
  const message = messageInput.value;

  if (message.trim() !== "") {
    // addMessage(message, 'user');
    sendLoginStatus(message, globalState.user.id);
    messageInput.value = "";
  }
}

export function chatContent() {
  if (!globalState.friends) return `<p>No friends</p>`;

  // get username parameter from url to fetch user data
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user");
  if (username) {
    data.friend = globalState.friends.find(
      (f) => f.friend.username === username
    );
    if (!data.friend) {
      return `
                <div class="chat" style="background: none; width: 100%; display: block;">
                    ${username} not found
                </div>
            `;
    }
    data.friend = data.friend.friend;
  }
  return `
        <div class="chat">
            ${chatProfile()}

            <div class="chat-friends" style="
            background: #5fa296;
            background: linear-gradient(0deg, rgba(34, 193, 195, 1) 0%, rgb(17 181 168) 100%);">
                ${chatFriend()} 
            </div>

            <div id="chat-content" class="chat-content" style="
            border-style: solid;
            box-shadow: aqua;
            border-color: #00b090;
            background: rgb(175 212 213);
            overflow-y: scroll;">
                ${chatMessages()}
            </div>
            
            ${chatInput()}
            
        </div>
    `;
}

function chatFriend() {
  let innerHtml = "";
  globalState.friends.forEach((f) => {
    innerHtml += `
            <div class="chat-friend" id="${f.friend.username}" style="
            border-bottom-style: solid;
            border-color: #15e1d7;">
                <img src="${f.friend.avatar}" alt="friend">
                <p>${f.friend.username}</p>
                <span class="offline"></span>
            </div>\n
        `;
  });

  if (innerHtml === "") innerHtml = `<p>No friends</p>`;
  return innerHtml;
}

function chatProfile() {
  if (!data.friend) return ``;
  const unFriendButton = {innerHtml: `<i key=${data.friend.username} class="fas fa-user-minus"></i>`, class: 'btn btn-unfriend', key: data.friend.username};
  const playButton = {innerHtml: `<i key=${data.friend.username} class="fas fa-gamepad"></i>`, class: 'btn btn-play', key: data.friend.username};
  const viewButton = {innerHtml: `<i key=${data.friend.username} class="fas fa-eye"></i>`, class: 'btn btn-view', key: data.friend.username};

  return `
        <div class="chat-header" style="
            background-color: #cfefea;
            background: rgb(34,193,195);
            background: linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(0,249,229,1) 100%);">
            <div class="chat-profile">
                <img src="${data.friend.avatar}" alt="friend">
                <p>${data.friend.username}</p>
            </div>
            <div class="chat-buttons" >
                <button id="invite-button" class="btn btn-play" key="${data.friend.username}"><i key="${data.friend.username}" class="fas fa-gamepad"></i></button>
                <button class="btn btn-unfriend" key="${data.friend.username}"><i key="${data.friend.username}" class="fas fa-user-minus"></i></button>
                <button class="btn btn-view" key="${data.friend.username}"><i key="${data.friend.username}" class="fas fa-eye"></i></button>
            </div>
        </div>
    `;
}

function chatMessages() {
  if (!data.friend) return ``;

  return `
    <div class="right">
        <p>hey </p>
    </div>
    <div class="left">
        <p>how are you?</p>
    </div>
    `;
}

function chatInput() {
  if (!data.friend) return ``;

  return `
        <div class="chat-input" style="
        /* background: rgb(34 195 169); */
        background: linear-gradient(0deg, rgba(34, 193, 195, 1) 0%, rgba(0, 249, 229, 1) 100%);
        border-style: solid;
        border-color: #3ce2e1;">
            <input id="input-box" type="text" placeholder="Type a message..." style="background: rgb(11 86 87);">
            <button id="message" >Send</button>
        </div>       
    `;
}

export async function chatScript() {
  const viewProfileButtons = document.querySelectorAll('.chat button.btn-view');
  viewProfileButtons?.forEach(button => {
      button.addEventListener('click', async (e) => {
          const username = e.target.getAttribute('key');
          history.pushState(null, null, `/profile?username=${username}`);
          urlHandler();
      })
  })

  const unfriendButton = document.querySelectorAll('.chat button.btn-unfriend');
  unfriendButton?.forEach(button => {
      button.addEventListener('click', async (e) => {
          await handleUnfriend(e);
          await fetchProfile();
      })
  })

  const friends = document.querySelectorAll(".chat-friend");
  if (friends) {
    friends.forEach((f) => {
      f.addEventListener("click", async () => {
        history.pushState(null, null, `/chat?user=${f.id}`);
        urlHandler();
      });
    });
  }

  if (data.Socket) data.Socket.close();
  if (data.friend) {
    if (data.Socket) data.Socket.close();
    data.Socket = null;
    if (globalState.user.id > data.friend.id)
      data.Roomname = data.friend.id + "" + globalState.user.id;
    else data.Roomname = globalState.user.id + "" + data.friend.id;
    initializeWebSocket();
  }

  const login = (e) => {
    new_message();
  };
  if (document.getElementById("message"))
    document.getElementById("message").onclick = login;

    const invite = (e) => {
        sendInvitation();
    };
    if (document.getElementById("invite-button"))
        document.getElementById("invite-button").onclick = invite;
}

async function getConversation() {
  const chatBox = document.getElementById("chat-content");
  chatBox.innerHTML = "";
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/chat/conversations/${data.Roomname}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages.");
    }

    const messages = await response.json();

    // Access the nested 'messages' array
    const messageList = messages.messages;

    if (Array.isArray(messageList)) {
      messageList.forEach((message) => {
        const senderType =
          message.sender.id === globalState.user.id ? "user" : "other";
        addMessage(message.content, senderType);
      });
    } else {
      console.warn("No messages available or messages is not an array.");
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

async function createConversation() {
  try {
    const response = await fetch("http://127.0.0.1:8000/chat/conversations/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        roomname: data.Roomname,
        participants: [globalState.user.id, data.friend.id],
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to create conversation.");
    }

    const newConversation = await response.json();

    getConversation();
  } catch (error) {
    console.error("Error creating conversation:", error);
  }
}

async function initializeWebSocket() {
  if (data.Socket) {
    if (data.Socket.readyState === WebSocket.OPEN) {
      data.Socket.close();
      return;
    } else if (data.Socket.readyState === WebSocket.CONNECTING) {
      return; // Stil connecting
    } else if (data.Socket.readyState === WebSocket.CLOSING) {
    }
  }

  data.Socket = new WebSocket(`ws://127.0.0.1:8000/ws/Chat/${data.Roomname}/`);
  // data.Socket = new WebSocket(
  //     'ws://' + window.location.host + `/ws/Chat/${data.Roomname}/`
  // );

  await createConversation();

  data.Socket.onopen = function () {
  };

  data.Socket.onmessage = async function (event) {
    const res = JSON.parse(event.data);

    const senderType = res.id === globalState.user.id ? "user" : "other";
    addMessage(res.message, senderType);

    if (res.id === globalState.user.id) {
      if (res.message) {
        try {
          const response = await fetch("http://127.0.0.1:8000/chat/messages/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              sender_id: globalState.user.id,
              receiver_id: data.friend.id,
              roomname: data.Roomname,
              content: res.message,
            }),
          });

          if (!response.ok) {
            throw new Error("Error saving message.");
          }

          const responseData = await response.json();
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    }
  };

  data.Socket.onerror = function (error) {
    console.error("WebSocket Error:", error);
  };

  data.Socket.onclose = function () {
  };
}


