package online.jnelson.emsfullstack.controller;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/current-user")
    public CurrentUser getCurrentUser(Principal principal) {
        if (principal == null) {
            return null;
        }

        UserDetails userDetails = (UserDetails) ((org.springframework.security.core.Authentication) principal).getPrincipal();
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return new CurrentUser(userDetails.getUsername(), roles);
    }

    public static class CurrentUser {
        private String username;
        private List<String> roles;

        public CurrentUser(String username, List<String> roles) {
            this.username = username;
            this.roles = roles;
        }

        public String getUsername() {
            return username;
        }

        public List<String> getRoles() {
            return roles;
        }
    }
}
