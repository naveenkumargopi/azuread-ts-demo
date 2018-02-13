<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <title>Spring Security Social ThumbSignIn User Page.</title>
    <script src="https://thumbsignin.com/thumbsign_widget.js"></script>
</head>
<body>
    <h2>Welcome!!</h2><br/><br/>
    You have successfully logged into this application via <b>Azure B2C using your social account (Facebook) or your email account.</b>
    <br/>
    <br/>
    <a href="<c:url value="/j_spring_security_logout" />">Logout</a>
    <br/>
    <br/>

</body>

</body>
</html>