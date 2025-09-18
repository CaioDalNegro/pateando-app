package br.com.pateandoapp.pateandobackend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;
import br.com.pateandoapp.pateandobackend.service.UsuarioService;

/**
 * Controller responsável pelos endpoints de Usuário.
 */
@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*") // habilita CORS para frontend React Native
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuariorepository;

    // POST - Criar novo usuário
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Usuario usuario) {
        if (usuariorepository.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.badRequest().body("Email já cadastrado!");
        }
        Usuario salvo = usuariorepository.save(usuario);
        return ResponseEntity.ok(salvo);
    }

    // GET - Listar todos os usuários
    @GetMapping
    public ResponseEntity<List<Usuario>> listAllUsers() {
        return ResponseEntity.ok(usuarioService.listUsers());
    }

    // GET - Buscar usuário por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> findById(@PathVariable Long id) {
        return usuarioService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Remover usuário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        usuarioService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> user) {
        String email = user.get("email");
        String senha = user.get("senha");

        Optional<Usuario> usuario = usuarioService.login(email, senha);

        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get()); // retorna ResponseEntity<Usuario>
        } else {
            return ResponseEntity.status(401).body("Email ou senha inválidos!"); // retorna ResponseEntity<String>
        }
    }

}
