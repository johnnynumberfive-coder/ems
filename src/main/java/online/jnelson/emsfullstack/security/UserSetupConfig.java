package online.jnelson.emsfullstack.security;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;   // ← add this
import org.springframework.security.provisioning.UserDetailsManager;

@Configuration
public class UserSetupConfig {

    @Bean
    public CommandLineRunner createDefaultUser(
            UserDetailsManager userDetailsManager,
            PasswordEncoder passwordEncoder) {                 // ← inject it here

        return args -> {
            String username = "johnn";
            if (!userDetailsManager.userExists(username)) {
                UserDetails johnn = User.withUsername(username)
                        .password(passwordEncoder.encode("john123"))  // ← now it compiles
                        .roles("EMPLOYEE", "MANAGER", "ADMIN")
                        .build();

                userDetailsManager.createUser(johnn);
            }
        };
    }
}