<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Login Page</title>
        <style>
            /* Basics */
            html, body
            {
                padding: 0;
                margin: 0;
                width: 100%;
                height: 100%;
                font-family: "Helvetica Neue" , Helvetica, sans-serif;
                background: #FFFFFF;
            }
            .logincontent
            {
                position: fixed;
                width: 300px;
                height: 250px;
                top: 50%;
                left: 50%;
                margin-top: -150px;
                margin-left: -250px;
                background: #07A8C3;
                padding-top: 10px;
            }
            .tslogincontent
            {
                position: fixed;
                width: 300px;
                height: 470px;
                top: 50%;
                left: 50%;
                margin-top: -250px;
                margin-left: 50px;
                background: #FFFFFF;
                padding-top: 10px;
            }
            .loginheading
            {
                border-bottom: solid 1px #ECF2F5;
                padding-left: 18px;
                padding-bottom: 10px;
                color: #ffffff;
                font-size: 20px;
                font-weight: bold;
                font-family: sans-serif;
            }
            #btnSubmit {
            color: white;
            border-radius: 2px;
            background-color: black;
            width: 230px;
            height: 40px;
            outline: 0;
            border: 1px solid #07A8C3;
            cursor: pointer;
            font-size: 14px;
            padding-left: 25px;
            text-transform: none;
            background-position: 5px;
            background-image: url(../images/azureadicon.ico);
            background-repeat: no-repeat;
            }
        </style>
        <script src="https://thumbsignin.com/thumbsign_widget.js"></script>
</head>
<body>
		<div class="logincontent">
        	<div class="loginheading">
            	Login
        	</div>

       		<form class="ts-auth-button" name='loginForm' action="<c:url value='../azuread/auth' />" method='POST'>
            	<input type="submit" class="ts-auth-button" value="Signin with Azure AD " id="btnSubmit" style="margin-top: 35px; margin-left: 35; font-weight: bold;"/>
         	</form> 
         	
         	<button class="ts-auth-button" id="tsBtn" onclick="login.open()" style="border: 1px solid rgb(72, 210, 160); background-color: rgb(72, 210, 160);">Signin with Thumbsignin</button>
         	<script>
         		(function(){document.write("<style>#tsBtn{color:#fff;border-radius:2px;background-color:#cccccc;width:230px;height:40px;margin-top: 20px;margin-left: 35;outline:0;border:1px solid #cccccc;cursor:pointer;font-size:16px;padding-left:30px;text-transform:none;background-position: 5px;background-image:url('https://thumbsignin.com/styles/img/logoIcon.png');background-repeat:no-repeat}</style>");})();
         	</script>         	       
        </div>
        
        <div id="loginDiv" class="tslogincontent"></div>
        
  <script type="text/javascript">
        thumbSignIn
        .addConfig('LOGIN_WIDGET', {
            actionUrl: "../services/authenticate/",
            statusUrl: "../services/authStatus/",
            COMPLETED_SUCCESSFUL: "You have successfully logged in using your fingerprint",
            DEEP_LINK: "Open in Thumbsignin app",
            desktop: {
                'intro-msg': "Scan the QR code above using the ThumbSignIn app on your phone to log in to your account.",
                TIMEOUT: "Scan the QR code above using the ThumbSignIn app on your phone to log in to your account.",
            },
            mobile: {
                'intro-msg': "",
                TIMEOUT: "",
            },
            sms: {
                playStoreURL: 'https://play.google.com/store/apps/details?id=com.pramati.thumbsignin.app',
                appStoreURL: 'https://itunes.apple.com/in/app/thumbsignin/id1279260047',
                smsContent: 'Please visit this link to download App'
            }
        });

    thumbSignIn
        .init({
            name: 'login',
            id: 'LOGIN_WIDGET',
            rootID: 'loginDiv'
        }).then(function () {
            login.registerEvent('SUCCESS', function (response) {
                window.location.hash = '';
                window.location.pathname = response.redirectUrl || "/";
            }, window);
            login.close();
        });
  </script>

</body>
</html>
