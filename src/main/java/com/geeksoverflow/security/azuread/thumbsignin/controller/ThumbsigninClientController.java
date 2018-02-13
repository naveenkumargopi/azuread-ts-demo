package com.geeksoverflow.security.azuread.thumbsignin.controller;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.geeksoverflow.security.azuread.thumbsignin.helper.HttpClientHelper;
import com.pramati.thumbsignin.servlet.sdk.ThumbsignInResponse;

@RestController
public class ThumbsigninClientController {

	private final static String tsAppId = "f825fccb97b541989858c233576df0bc";
    
    private final static String tsAppSecret = "7c02776988b395f7cbedded756eb71c65e8fca41619fa77f85433f4bdb709f29";
    
    private final static String REGISTER = "register";
    
    private final static String AUTH_STATUS = "authStatus";
    
    private final static String COMPLETED_SUCCESSFUL = "COMPLETED_SUCCESSFUL";
    
    private static final String USER_REMOVED_FROM_AZURE_AD = "userRemovedFromAzureAD";
    
    private static CloseableHttpClient httpclient = HttpClients.createDefault();
    
    @Autowired
    private AuthDataHelper authDataHelper;
    	
	@RequestMapping(value = { "/authenticate", "/register", "/authStatus/{transactionId}", "/regStatus/{transactionId}"}, 
			method = RequestMethod.GET)
    public void handleThumbsigninRequests(HttpServletRequest request, HttpServletResponse response) throws ServletException,IOException, URISyntaxException {
		//String apiResponse = invokeThumbsigninAzureIntegrationAPI(request.getPathInfo(), response);
		String apiResponse = invokeTSAADGatewayAPI(request.getPathInfo(), response);
		if (request.getPathInfo().contains(AUTH_STATUS) && apiResponse.contains(COMPLETED_SUCCESSFUL) && !apiResponse.contains(USER_REMOVED_FROM_AZURE_AD)) {
			authDataHelper.storeUserAuthDataInSession(apiResponse);
		}
		response.getWriter().write(apiResponse);
    }
	
	private String invokeTSAADGatewayAPI(String path, HttpServletResponse response) throws URISyntaxException, ClientProtocolException, IOException {
    	path = (path.contains(REGISTER)) ? path + authDataHelper.getUserIdFromSession() : path;
		String urlStr = String.format("https://azuread-api-stage.thumbsignin.com/ts-aad/secure%s",path);
		//String urlStr = String.format("http://52.38.227.15:8081/azuread-thumbsignin-integration-saas-1.0-SNAPSHOT/ts-aad/secure%s",path);
		//String urlStr = String.format("https://api.thumbsignin.com/ts/secure%s",path);
    	//String urlStr = String.format("http://localhost:8012/ts-aad/secure%s",path);
		URI uri = new URIBuilder(urlStr).build();		
		HttpGet httpget = new HttpGet(uri);
		
		String signatureTimestamp = HmacSignatureBuilder.getTimeStamp();
		httpget.addHeader("Content-Type", "application/json");
		httpget.addHeader("Accept", "application/json");
		httpget.addHeader(HmacSignatureBuilder.X_TS_DATE_HEADER, signatureTimestamp);
		httpget.addHeader("Authorization", HmacSignatureBuilder.createHmacSignature(uri.getPath(),signatureTimestamp, tsAppId, tsAppSecret));
				
		ResponseHandler<String> responseHandler = new ResponseHandler<String>() {
            @Override
            public String handleResponse(HttpResponse response) throws IOException {
                HttpEntity entity = response.getEntity();
                String jsonResponse = entity != null ? EntityUtils.toString(entity) : null;
                return jsonResponse;
            }
        };
		
        return httpclient.execute(httpget, responseHandler);
	}
	
}
