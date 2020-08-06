class Chat{
    constructor(){
        let that = this;
        this.users = [];
        this.socket = io.connect();

        this.socket.on('connect', () => {
            document.querySelector('#nickWrapper').style.display = 'block';
            document.querySelector('#nicknameInput').focus();
        });

        this.socket.on('nickExisted', () =>{
            document.querySelector('#info').textContent = 'se encuentra en uso,elija otro';
        });

        this.socket.on('loginSuccess', () => {
            document.title = 'chat | ' + document.querySelector('#nicknameInput').value;
            document.querySelector('#loginWrapper').style.display = 'none';
            document.querySelector('#messageInput').focus();
        });

        this.socket.on('error', (err) => {
            if (document.querySelector('#loginWrapper').style.display == 'none') {
                document.querySelector('#status').textContent = 'Error';
            } else {
                document.querySelector('#info').textContent = 'Error';
            }
        });

        this.socket.on('system', (nickName, userCount, type) => {
            const msg = nickName + (type == 'login' ? ' En Linea' : ' x');
            that.displayNewMsg('', msg, '#1CCC8B');
            document.querySelector('#status').textContent = userCount + (userCount > 1 ? ' usuarios' : ' usuario') + ' Conectado';

        });

        this.socket.on('newMsg', (user, msg, color) => {
            that.displayNewMsg(user, msg, color);
        });

        this.socket.on('newImg', (user, img, color) => {
            that.displayImage(user, img, color);
        });

        document.querySelector('#loginBtn').addEventListener('click', () => {
            let nickName = document.querySelector('#nicknameInput').value;

            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.querySelector('#nicknameInput').focus();
            };
        });

        document.querySelector('#nicknameInput').addEventListener('keyup', (e) => {
            if (e.keyCode == 13) {
                const nickName = document.querySelector('#nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        });

        document.querySelector('#sendBtn').addEventListener('click', () => {
            const messageInput = document.querySelector('#messageInput');
            const msg = messageInput.value;
            const color = document.querySelector('#colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that.displayNewMsg('Yo', msg, color);
                return;
            };
        });
        
        document.querySelector('#messageInput').addEventListener('keyup', (e) => {
            const messageInput = document.querySelector('#messageInput');
            const msg = messageInput.value;
            const color = document.querySelector('#colorStyle').value;

            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that.displayNewMsg('Yo', msg, color);
            }
        });

        document.querySelector('#clearBtn').addEventListener('click', () => {
            document.querySelector('#historyMsg').innerHTML = '';
        });
        
        document.querySelector('#sendImage').addEventListener('change', function() {
            if (this.files.length !== 0) {
                const file = this.files[0];
                const reader = new FileReader();
                const color = document.querySelector('#colorStyle').value;

                if (!reader) {
                    that.displayNewMsg('mendo.user', 'Your browser doesn\'t support fileReader', '#C7050A');
                    this.value = '';
                    return;
                }

                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that.displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        });

        this.initialEmoji();

        document.querySelector('#emoji').addEventListener('click', function(e) {
            const emojiwrapper = document.querySelector('#emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        });
        
        document.body.addEventListener('click', function(e) {
            const emojiwrapper = document.querySelector('#emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });

        document.querySelector('#emojiWrapper').addEventListener('click', function(e) {
            const target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                const messageInput = document.querySelector('#messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        });
    }

    initialEmoji() {
        const emojiContainer = document.querySelector('#emojiWrapper');
        const docFragment = document.createDocumentFragment();
        for (let i = 6; i > 0; i--) {
            const emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    }

    showEmoji(msg) {
        let match;
        let result = msg;
        let reg = /\[emoji:\d+\]/g;
        let emojiIndex;
        const totalEmojiNum = document.querySelector('#emojiWrapper').children.length;

        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            }
        }
        return result;
    }

    displayNewMsg(user, msg, color) {
        const container = document.querySelector('#historyMsg');
        const msgToDisplay = document.createElement('p');
        const date = new Date().toTimeString().substr(0, 8);
            //determine whether the msg contains emoji
        const msgN = this.showEmoji(msg);
        msgToDisplay.style.color = color || '#A13687';
        msgToDisplay.innerHTML = user + "➤" + msgN + "⠀" + '<span class="timespan">(' + date + ') </span>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }

    displayImage(user, imgData, color) {
        const container = document.querySelector('#historyMsg');
        const msgToDisplay = document.createElement('p');
        const    date = new Date().toTimeString().substr(0, 8);

        msgToDisplay.style.color = color || '#A13687';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + `<img src="${imgData}"/>`;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
    
									
}

window.onload = function() {
	var hichat = new Chat();
};



