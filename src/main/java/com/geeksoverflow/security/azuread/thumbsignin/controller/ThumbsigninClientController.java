package com.geeksoverflow.security.azuread.thumbsignin.controller;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.geeksoverflow.security.azuread.thumbsignin.helper.HttpClientHelper;

@RestController
public class ThumbsigninClientController {

	private final static String tsAppId = "f825fccb97b541989858c233576df0bc";
    
    private final static String tsAppSecret = "7c02776988b395f7cbedded756eb71c65e8fca41619fa77f85433f4bdb709f29";
    
    private final static String REGISTER = "register";
    
    private final static String AUTH_STATUS = "authStatus";
    
    private final static String COMPLETED_SUCCESSFUL = "COMPLETED_SUCCESSFUL";
    
    @Autowired
    private AuthDataHelper authDataHelper;
    	
	@RequestMapping(value = { "/authenticate", "/register", "/authStatus/{transactionId}", "/regStatus/{transactionId}"}, 
			method = RequestMethod.GET)
    public void handleThumbsigninRequests(HttpServletRequest request, HttpServletResponse response) throws ServletException,IOException {
		String apiResponse = invokeThumbsigninAzureIntegrationAPI(request.getPathInfo());
		if (request.getPathInfo().contains(AUTH_STATUS) && apiResponse.contains(COMPLETED_SUCCESSFUL)) {
			authDataHelper.storeUserAuthDataInSession(apiResponse);
		}
		response.getWriter().write(apiResponse);
    }
	
	private String invokeThumbsigninAzureIntegrationAPI(String path) {
    	String response = "";
    	try
    	{
    		path = (path.contains(REGISTER)) ? path + authDataHelper.getUserIdFromSession() : path;
    		String urlStr = String.format("http://dev-api.thumbsignin.com:8012/ts-aad/secure%s",path);
    		//String urlStr = String.format("http://52.38.227.15:8081/azuread-thumbsignin-integration-saas-1.0-SNAPSHOT/ts-aad/secure%s",path);
    		URL url = new URL(urlStr);
    		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    		conn.setRequestProperty("Content-Type", "application/json");
    		conn.setRequestProperty("Accept", "application/json");
    		conn.setRequestProperty(HmacSignatureBuilder.X_TS_DATE_HEADER, HmacSignatureBuilder.getTimeStamp());
    		conn.setRequestProperty("Authorization", HmacSignatureBuilder.createHmacSignature(url.getPath(),conn, tsAppId, tsAppSecret));
    		
    		response = HttpClientHelper.getResponseStringFromConn(conn, true);
    	}
    	catch (Exception e)
    	{
    		System.out.println(e.getMessage());
    	}
    	return response;
    }
	
}
