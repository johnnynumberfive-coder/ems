package online.jnelson.emsfullstack.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import online.jnelson.emsfullstack.entity.Employee;
import online.jnelson.emsfullstack.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class UserController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional
    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Integer id,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam(required = false) MultipartFile profilePic
    ) throws IOException {

        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));

        e.setFirstName(firstName);
        e.setLastName(lastName);
        e.setEmail(email);

        if (profilePic != null && !profilePic.isEmpty()) {
            e.setProfilePic(profilePic.getBytes());
        }

        employeeRepository.save(e);

        return ResponseEntity.ok(e);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Integer id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        employeeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }





    @Transactional
    @PostMapping("/employees/add")
    public ResponseEntity<Employee> addEmployeeWithProfile(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam(required = false) MultipartFile profilePic) throws IOException {

        Employee e = new Employee();
        e.setFirstName(firstName);
        e.setLastName(lastName);
        e.setEmail(email);

        if (profilePic != null && !profilePic.isEmpty()) {
            e.setProfilePic(profilePic.getBytes());
        }

        employeeRepository.save(e);
        return ResponseEntity.ok(e);
    }

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
