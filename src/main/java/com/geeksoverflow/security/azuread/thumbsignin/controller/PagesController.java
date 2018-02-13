package com.geeksoverflow.security.azuread.thumbsignin.controller;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.http.client.methods.HttpGet;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.geeksoverflow.security.azuread.thumbsignin.helper.AuthHelper;
import com.geeksoverflow.security.azuread.thumbsignin.helper.HttpClientHelper;
import com.geeksoverflow.security.azuread.thumbsignin.helper.JSONHelper;
import com.geeksoverflow.security.azuread.thumbsignin.model.AzureADClientProps;
import com.geeksoverflow.security.azuread.thumbsignin.model.Membership;
import com.geeksoverflow.security.azuread.thumbsignin.model.User;
import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;
import com.microsoft.aad.adal4j.ClientCredential;



/**
 * @author <a href="mailto:sunil.pulugula@wavemaker.com">Sunil Kumar</a>
 * @since 22/3/16
 */
@RestController
public class PagesController {

    @Autowired
    AzureADClientProps azureADClientProps;
    
    private List<Membership> listOfUserMemberships_loggedInUser;
    
    private String clientAccessToken = null;
    
    private boolean isUserAuthenticatedViaThumbsignin = false;
    
    private static final String USER_NOT_FOUND_IN_AD = "{User name not set in Azure AD for this user}";
    
    private final static String tsAppId = "f825fccb97b541989858c233576df0bc";
    
    private final static String tsAppSecret = "7c02776988b395f7cbedded756eb71c65e8fca41619fa77f85433f4bdb709f29";

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public ModelAndView login(HttpServletRequest request, HttpServletResponse response) throws ServletException,IOException {
        ModelAndView model = new ModelAndView();
        model.addObject("title", "Login Page");
        model.setViewName("login");
        return model;
    }

    @RequestMapping(value = {"/accessdenied"}, method = RequestMethod.GET)
    public ModelAndView accessDeniedPage() {
        ModelAndView model = new ModelAndView();
        model.addObject("message", "Either your user credentials are incorrect or your account has been removed from Azure AD.");
        model.setViewName("accessdenied");
        return model;
    }

    @RequestMapping(value = {"/userlandingpage"}, method = RequestMethod. GET)
    public ModelAndView userPage(HttpServletRequest httpRequest) {
        ModelAndView model = new ModelAndView();
        model.addObject("title", "User Landing Page");
        model.addObject("user", getLoggedInUserName());
        model.addObject("userId", getUserIdFromSession());
        if (isUserAuthenticatedViaThumbsignin) {
        	model.addObject("loginApproach", "Thumbsignin Authentication");
        } else {
        	model.addObject("loginApproach", "Azure AD User Credentials");
        }
        model.addObject("userRoles", getUserRoles(httpRequest));
        model.setViewName("userlandingpage");
        clientAccessToken = null;
        isUserAuthenticatedViaThumbsignin = false;
        return model;
    }
    
    @RequestMapping(value = {"/b2csuccesspage"}, method = RequestMethod. GET)
    public ModelAndView b2csuccesspage(HttpServletRequest httpRequest) {
        ModelAndView model = new ModelAndView();
        model.addObject("title", "User Landing Page");
        model.setViewName("b2csuccesspage");

        return model;
    }
    
    private String getUserIdFromSession() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication.getPrincipal().toString();
	}
    
    private String getUserNameFromSession() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication.getCredentials() != null) {
			return authentication.getCredentials().toString();
		} else {		
			return "Name not found in session";
		}
	}
    
    private List<Membership> getUserRolesFromSession() {
    	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    	if (authentication.getDetails() != null) {
    		if (authentication.getDetails() instanceof List<?>) {
    			List<Membership> details = (List<Membership>) authentication.getDetails();
    			return details;
    		} else {
    			return new ArrayList<>();
    		}			
		} else {		
			return new ArrayList<>();
		}
    }

    @RequestMapping(value = {"/tsAuthSuccessPage"}, method = RequestMethod.GET)
    public ModelAndView tsAuthSuccessPage() {		
    	ModelMap modelMap = new ModelMap();
		modelMap.addAttribute("listOfUserMemberships", getUserRolesFromSession());
		
		ModelAndView model = new ModelAndView();
        model.addObject("title", "User Landing Page");
        model.addObject("user", getUserNameFromSession());
        model.addObject("userId", getUserIdFromSession());
        model.addObject("loginApproach", "Thumbsignin Authentication");
        model.addObject("userRoles", modelMap);
        model.setViewName("userlandingpage");
        return model;
    }
    
    @RequestMapping(value = {"/tsRegistrationSuccessPage"}, method = RequestMethod.GET)
    public ModelAndView tsRegistrationSuccessPage() {		
        ModelAndView model = new ModelAndView();
        model.addObject("title", "ThumbSignIn Successful Registration Page");
        model.addObject("user", getUserNameFromSession());
        model.setViewName("thumbsigninregisteruser");
        return model;
    }

    @RequestMapping(value = {"/thumbsignin/userpage"}, method = RequestMethod.GET)
    public ModelAndView thumbSignInUserPage() {

        ModelAndView model = new ModelAndView();
        model.addObject("title", "ThumbSignIn User Landing Page");
        model.addObject("user", getLoggedInUserName());
        model.setViewName("thumbsigninregisteruser");
        return model;
    }

    private String getLoggedInUserName() {
        String userName = null;
        Object credential = SecurityContextHolder.getContext().getAuthentication().getCredentials();
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        /*if (principal instanceof UserDetails) {
            userName = ((UserDetails) principal).getUsername();
        } else {
            userName = principal.toString();
        }*/
        if (credential != null) {
        	userName = credential.toString();
        } else {
        	userName = USER_NOT_FOUND_IN_AD;
        }
                
        //Logic to fetch the username during Thumbsignin Authentication Flow
        if ((credential != null && principal != null) && credential.toString().equals(principal.toString())) {
        	isUserAuthenticatedViaThumbsignin = true;
        	String tenant = azureADClientProps.getTenant();
        	if (clientAccessToken == null) {
        		clientAccessToken = acquireAccessTokenForClientApp();
        	}
        	userName = getUserNameByIdFromGraph(principal.toString(), clientAccessToken, tenant);      	
        	userName = (userName == null || userName.equalsIgnoreCase("null")) ? USER_NOT_FOUND_IN_AD:userName;
        }
        return userName;
    }

    private String acquireAccessTokenForClientApp() {
    	String accessToken = "";
    	try {
			ExecutorService service = Executors.newFixedThreadPool(1);
			AuthenticationContext context = new AuthenticationContext(azureADClientProps.getAuthority()+azureADClientProps.getTenant()+"/", false, service);
			
			ClientCredential credential = new ClientCredential(azureADClientProps.getClientId(), azureADClientProps.getClientSecret());
			Future<AuthenticationResult> future = context.acquireToken("https://graph.windows.net", credential, null);
			AuthenticationResult result = future.get();
			accessToken = result.getAccessToken();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		} 
    	return accessToken;
    }
    
    private ModelMap getUserRoles(HttpServletRequest httpRequest){
        ModelMap model = new ModelMap();
        String tenant = azureADClientProps.getTenant();
        HttpSession session = httpRequest.getSession();
        AuthenticationResult result = (AuthenticationResult) session.getAttribute(AuthHelper.PRINCIPAL_SESSION_NAME);
        
        if (result == null) {
        	Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        	if (principal != null) {
        		String userId = principal.toString();
        		if (clientAccessToken == null) {
            		clientAccessToken = acquireAccessTokenForClientApp();
            	}
        		listOfUserMemberships_loggedInUser = getUserMembershipFromSaaS(userId);
        		//listOfUserMemberships_loggedInUser = getUserMembershipInfoFromGraph(userId, clientAccessToken, tenant);
        		//getUserRolesFromMSGraph(userId, accessToken, tenant);
        		model.addAttribute("listOfUserMemberships", listOfUserMemberships_loggedInUser);
        	} else {
        		model.addAttribute("error", new Exception("AuthenticationResult not found in session."));
        	}
        } else {
            try {               
                listOfUserMemberships_loggedInUser = getUserMembershipInfoFromGraph(result.getUserInfo().getUniqueId(), result.getAccessToken(), tenant);
                //getUserRolesFromMSGraph(result.getUserInfo().getUniqueId(), result.getAccessToken(), tenant);
                model.addAttribute("listOfUserMemberships", listOfUserMemberships_loggedInUser);
            } catch (Exception e) {
                model.addAttribute("error", e);
            }
        }
        return model;
    }

    private List<Membership> getUserMembershipFromSaaS(String userid) {
    	List<Membership> listOfUserMemberships = new ArrayList<>();
    	try
    	{
    		String urlStr = String.format("http://localhost:8012/aad/secure/user/%s/getUserMemberships", userid);
    		URL url = new URL(urlStr);
    		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    		conn.setRequestProperty("Content-Type", "application/json");
    		conn.setRequestProperty("Accept", "application/json");
    		conn.setRequestProperty(HmacSignatureBuilder.X_TS_DATE_HEADER, HmacSignatureBuilder.getTimeStamp());
    		conn.setRequestProperty("Authorization", createHmacSignature(url.getPath(),conn));
    		
    		String responseStr = HttpClientHelper.getResponseStringFromConn(conn, true);
            JSONArray userMemberships = new JSONArray(responseStr);
            
            Membership membership;
            for (int i = 0; i < userMemberships.length(); i++) {
                JSONObject userMembershipJSONObject = userMemberships.optJSONObject(i);
                membership = new Membership();
                JSONHelper.convertJSONObjectToDirectoryObject(userMembershipJSONObject, membership);
                listOfUserMemberships.add(membership);
            }
    	}
    	catch (Exception e)
    	{
    		System.out.println(e.getMessage());
    	}
    	return listOfUserMemberships;
    }
    
    private String createHmacSignature(String path, HttpURLConnection conn) {
        final HmacSignatureBuilder signatureBuilder = new HmacSignatureBuilder.Builder(tsAppId, tsAppSecret)
                .scheme("http")
                .httpMethod(HttpGet.METHOD_NAME)
                .canonicalURI(path)
                .headers(getCanonicalizeHeaders(conn))
                .date(conn.getRequestProperty(HmacSignatureBuilder.X_TS_DATE_HEADER))
                .build();

        String authHeader = signatureBuilder.sign();
        return authHeader;
    }
    
    public static TreeMap<String, String> getCanonicalizeHeaders(HttpURLConnection conn) {

        TreeMap<String, String> canonicalizeHeaders = new TreeMap<>();
        
        Set<Map.Entry<String, List<String>>> entries = conn.getRequestProperties().entrySet();
        for (Map.Entry<String, List<String>> e : entries) {
            canonicalizeHeaders.put(e.getKey().toLowerCase(), e.getValue().get(0));
        }
        return canonicalizeHeaders;
    }
    
    private String getUserNameByIdFromGraph(String userid, String accessToken, String tenant) {
    	User user = new User();
    	try
    	{
    		String urlStr = String.format("https://graph.windows.net/%s/users/%s?api-version=1.6", tenant, userid);
    		
    		URL url = new URL(urlStr);

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            // Set the appropriate header fields in the request header.
            conn.setRequestProperty("api-version", "1.6");
            conn.setRequestProperty("Authorization", accessToken);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json;odata=minimalmetadata");
            
            String responseStr = HttpClientHelper.getResponseStringFromConn(conn, true);
            int responseCode = conn.getResponseCode();
            JSONObject response = HttpClientHelper.processGoodRespStr(responseCode, responseStr);
            JSONObject userJsonObj = JSONHelper.fetchDirectoryObjectJSONObject(response);
            JSONHelper.convertJSONObjectToDirectoryObject(userJsonObj, user);
    	}
    	catch (Exception e)
    	{
    		System.out.println(e.getMessage());
    	}
    	return user.getGivenName();
      }

    private List<Membership> getUserMembershipInfoFromGraph(String userid, String accessToken, String tenant) {
    	List<Membership> listOfUserMemberships = new ArrayList<>();
    	try
    	{
    		String urlStr = String.format("https://graph.windows.net/%s/users/%s/memberOf?api-version=1.6", tenant, userid);
    		
    		URL url = new URL(urlStr);

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            // Set the appropriate header fields in the request header.
            conn.setRequestProperty("api-version", "1.6");
            conn.setRequestProperty("Authorization", accessToken);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json;odata=minimalmetadata");
            
            String responseStr = HttpClientHelper.getResponseStringFromConn(conn, true);
            int responseCode = conn.getResponseCode();
            JSONObject response = HttpClientHelper.processGoodRespStr(responseCode, responseStr);
            JSONArray userMemberships;
            
            userMemberships = JSONHelper.fetchDirectoryObjectJSONArray(response);
            
            Membership membership;
            for (int i = 0; i < userMemberships.length(); i++) {
                JSONObject userMembershipJSONObject = userMemberships.optJSONObject(i);
                membership = new Membership();
                JSONHelper.convertJSONObjectToDirectoryObject(userMembershipJSONObject, membership);
                listOfUserMemberships.add(membership);
            }
    	}
    	catch (Exception e)
    	{
    		System.out.println(e.getMessage());
    	}
    	return listOfUserMemberships;
      }
    
    /*private void getUserRolesFromMSGraph(String userId, String accessToken, String tenant) {
    	String urlStr = String.format("https://graph.microsoft.com/v1.0/users/%s", userId);
    	
    	URL url;
		try {
			url = new URL(urlStr);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			
			// Set the appropriate header fields in the request header.
	        //conn.setRequestProperty("api-version", "1.6");
	        conn.setRequestProperty("Authorization", "Bearer "+accessToken);
	        conn.setRequestProperty("Content-Type", "application/json");
	        conn.setRequestProperty("Accept", "application/json;odata=minimalmetadata");
	        
	        String responseStr = HttpClientHelper.getResponseStringFromConn(conn, true);
			
		} catch (Exception e) {
			e.printStackTrace();
		}
    	
    	HttpURLConnection conn;
    }*/
}
