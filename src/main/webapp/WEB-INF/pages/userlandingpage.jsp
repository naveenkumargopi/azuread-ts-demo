<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <title>Spring Security Social ThumbSignIn User Page.</title>
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
    

    	<br/>
    	<button class="ts-auth-button" id="tsBtn" data-action-url="register/" data-status-url="regStatus/">
    	Register with Thumbsignin</button>
    	<script>(function(){document.write("<style>#tsBtn{color:#fff;border-radius:2px;background-color:#48d2a0;width:230px;height:40px;outline:0;border:1px solid #48d2a0;cursor:pointer;font-size:16px;padding-left:30px;text-transform:none;background-position: 5px;background-image:url('https://thumbsignin.com/styles/img/logoIcon.png');background-repeat:no-repeat}</style>");var ts = document.createElement("script");ts.src = "https://thumbsignin.com/ts_widget.js";ts.async = true;ts.defer = true;document.head.appendChild(ts);})();</script>

</body>
</html>