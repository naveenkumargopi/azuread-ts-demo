package com.geeksoverflow.security.azuread.thumbsignin.controller;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.ui.ModelMap;
import org.springframework.web.servlet.ModelAndView;

import com.geeksoverflow.security.azuread.thumbsignin.helper.JSONHelper;
import com.geeksoverflow.security.azuread.thumbsignin.model.Membership;

@Service
public class AuthDataHelper {
	
	public void storeUserAuthDataInSession(String authStatusResponse) {
		
		JSONObject authStatusResponseJson;
		List<Membership> listOfUserMemberships = new ArrayList<>();
		String userName = "";
		String userId = "";
		try {
			authStatusResponseJson = new JSONObject(authStatusResponse);
			if (authStatusResponseJson.has("userRolesFromAzure")) {
				JSONArray userMemberships = authStatusResponseJson.getJSONArray("userRolesFromAzure");
				Membership membership;
	            for (int i = 0; i < userMemberships.length(); i++) {
	                JSONObject userMembershipJSONObject = userMemberships.optJSONObject(i);
	                membership = new Membership();
	                JSONHelper.convertJSONObjectToDirectoryObject(userMembershipJSONObject, membership);
	                listOfUserMemberships.add(membership);
	            }			
			}			
			if (authStatusResponseJson.has("userNameFromAzure")) {
				userName = authStatusResponseJson.getString("userNameFromAzure");
			}
			
			if (authStatusResponseJson.has("userId")) {
				userId = authStatusResponseJson.getString("userId");
			}
			storeUserDetailsInSession(userId, userName, listOfUserMemberships);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}		
	}
	
	private void storeUserDetailsInSession(String userId, String userName, List<Membership> listOfUserMemberships) {
		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId, userName, null);
		authentication.setDetails(listOfUserMemberships);
		SecurityContextHolder.getContext().setAuthentication(authentication);
	}
	
	public String getUserIdFromSession() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication.getPrincipal().toString();
	}
		
}
