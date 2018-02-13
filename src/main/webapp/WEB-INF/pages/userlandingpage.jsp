<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <title>Spring Security Social ThumbSignIn User Page.</title>
    <script src="https://thumbsignin.com/thumbsign_widget.js"></script>
</head>
<body>
    <h2>${title}</h2><br/><br/>
    Dear <b>${user}</b>, you have successfully logged into this application through <b>${loginApproach}</b> method!!
    <br/>
    <br/>
    <a href="<c:url value="/j_spring_security_logout" />">Logout</a>
    <br/>
    <br/>
    
    <br>
	<h3>User Membership Info of the current logged in user (User ID: ${userId}):</h3>
 	<table border="1" cellpadding="3" cellspacing="0" width="200px" style="border-collapse:collapse;width:80%">
 	<tbody>
	<tr><th>Membership Type</th><th>Display Name</th><th>Description</th></tr>
	<c:forEach var="membership" items="${userRoles.listOfUserMemberships}" > 
 		<tr>
 			<td>${membership.objectType}</td><td>${membership.displayName}</td><td>${membership.description}</td>
 		</tr>
 	</c:forEach>
 	</tbody>
 	</table>
 	<br>
    
    <button class="ts-auth-button" id="tsBtn" onclick="register.open()" style="border: 1px solid rgb(72, 210, 160); background-color: rgb(72, 210, 160);">Register with Thumbsignin</button>
    <script>
        (function(){document.write("<style>#tsBtn{color:#fff;border-radius:2px;background-color:#cccccc;width:230px;height:40px;margin-top: 20px;margin-left: 35;outline:0;border:1px solid #cccccc;cursor:pointer;font-size:16px;padding-left:30px;text-transform:none;background-position: 5px;background-image:url('https://thumbsignin.com/styles/img/logoIcon.png');background-repeat:no-repeat}</style>");})();
    </script>

    	<br/>
    	<div id="registerDiv"></div>
    	

		<script type="text/javascript">
        thumbSignIn
        .addConfig('REGISTER_WIDGET', {
            actionUrl: "../services/register/",
            statusUrl: "../services/regStatus/",
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
            name: 'register',
            id: 'REGISTER_WIDGET',
            rootID: 'registerDiv'
        }).then(function () {
        	register.registerEvent('SUCCESS', function (response) {
                window.location.hash = '';
                window.location.pathname = response.redirectUrl || "/";
            }, window);
        	register.close();
        });
    </script>

</body>

</body>
</html>