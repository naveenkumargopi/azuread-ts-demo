package com.geeksoverflow.security.azuread.thumbsignin.client.thumbsignin;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.geeksoverflow.security.azuread.thumbsignin.model.LocalUser;
import com.geeksoverflow.security.azuread.thumbsignin.service.LocalUserDetailsService;

import com.pramati.thumbsignin.servlet.sdk.*;

/**
 * @author <a href="mailto:sunil.pulugula@wavemaker.com">Sunil Kumar</a>
 * @since 2/12/17
 */
public class MyThumbSignInServlet extends ThumbSignInServlet {

    private final ThumbsignInClient thumbsignInClient;

    public MyThumbSignInServlet() {
        this(new ThumbsignInClient(/*"https://faas.thumbsignin.com",*/ "f825fccb97b541989858c233576df0bc", "7c02776988b395f7cbedded756eb71c65e8fca41619fa77f85433f4bdb709f29"));
    }

    public MyThumbSignInServlet(final ThumbsignInClient thumbsignInClient) {
        this.thumbsignInClient = thumbsignInClient;
    }

    protected void doGet(HttpServletRequest servletRequest, HttpServletResponse servletResponse) throws ServletException, IOException
    {
        try {
            ThumbsignInRequest thumbsignInRequest = createThumbsignInRequest(servletRequest);
            ThumbsignInResponse thumbsignInResponse = thumbsignInClient.get(thumbsignInRequest);
            processResponse(thumbsignInRequest, thumbsignInResponse, servletRequest, servletResponse);
            servletResponse.getWriter().write(thumbsignInResponse.getDataAsString());
        } catch (Exception e) {
            servletResponse.setStatus(500);
            servletResponse.setHeader("Content-Type", "application/json");
            ObjectNode objectNode = new ObjectMapper().createObjectNode();
            objectNode.put("status", "failed");
            objectNode.put("message", e.getMessage());
        }
    }
    
    private ThumbsignInRequest createThumbsignInRequest(HttpServletRequest servletRequest) {
        String pathInfo = servletRequest.getPathInfo();
        pathInfo = pathInfo.substring(1);
        String[] pathParts = pathInfo.split("/");
        Action action = Action.fromValue(pathParts[0]);
        if ((action == null) || (Action.GET_USER.equals(action))) {
            throw new ThumbsigninException("Not Found");
        }
        ThumbsignInRequest thumbsignInRequest = new ThumbsignInRequest(action);
        thumbsignInRequest.addHeader("User-Agent", servletRequest.getHeader("User-Agent"));
        if (Action.REGISTER.equals(thumbsignInRequest.getAction())) {
            thumbsignInRequest.addQueryParam("userId", getUserId(servletRequest));
        } else if (Action.STATUS.equals(thumbsignInRequest.getAction())) {
            String cancelled = servletRequest.getParameter("cancelled");
            if ((cancelled != null) && ("true".equals(cancelled))) {
                thumbsignInRequest.addQueryParam("cancelled", cancelled);
            }
            thumbsignInRequest.setTransactionId(pathParts[1]);
        } else if (Action.AUTHENTICATE.equals(thumbsignInRequest.getAction())) {
        	SecurityContextHolder.getContext().setAuthentication(null);
        	SecurityContextHolder.clearContext();
        }
        return thumbsignInRequest;
    }

    private void processResponse(ThumbsignInRequest request, ThumbsignInResponse response, HttpServletRequest servletRequest, HttpServletResponse servletResponse) throws IOException {
        if (Action.STATUS.equals(request.getAction())) {
            handleStatusResponse(request, response, servletRequest, servletResponse);
        }
    }

    private void handleStatusResponse(ThumbsignInRequest request, ThumbsignInResponse response, HttpServletRequest servletRequest, HttpServletResponse servletResponse) throws IOException {
        Object status = response.getValue("status");
        if (TransactionStatus.COMPLETED_SUCCESSFUL.toString().equals(status)) {
            ThumbsignInResponse resp = thumbsignInClient.getAuthenticatedUser(request.getTransactionId());
            if ((resp.getStatus() == 200) && (resp.getValue("userId") != null)) {
            	String userId = (String)resp.getValue("userId");         	
                String landingPath = createUserSession(userId, servletRequest, servletResponse);
                response.getData().put("redirectUrl", landingPath);            
            }
        }
    }

    @Override
    public String createUserSession(final String userID, final HttpServletRequest request, final HttpServletResponse response) {
        String targetUrl = "";
        try {
        	if (!isAuthenticated()) {
        		/*WebApplicationContext webApplicationContext = WebApplicationContextUtils.getWebApplicationContext(request.getServletContext());
            	final LocalUserDetailsService userDetailsService = webApplicationContext.getBean(LocalUserDetailsService.class);
            	final UserDetails userDetails = userDetailsService.loadUserByUsername(userID);
            	Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails.getUsername(), null, userDetails.getAuthorities());*/
            
        		targetUrl = request.getContextPath() + "/services/userlandingpage";
        		Authentication authentication = new UsernamePasswordAuthenticationToken(userID, userID);
        		SecurityContextHolder.getContext().setAuthentication(authentication);
        	} else {
        		targetUrl = request.getContextPath() + "/services/thumbsignin/userpage";
        	}
        } catch(Exception e) {
        	System.out.println(e);
        }
        return targetUrl;
    }

    private static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication instanceof AnonymousAuthenticationToken ? false : true;
    }
    
    @Override
    public String getUserId(final HttpServletRequest paramHttpServletRequest) {
        if (isAuthenticated()) {
        	return getLoggedInUser();
        }
        throw new AuthenticationServiceException("User should login to register in thumb signin");
    }
    
    private String getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof LocalUser) {
                return ((LocalUser) principal).getUserId();
            } else {
            	return principal.toString();
            }
        }
        return null;
    }
    
}

