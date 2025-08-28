package br.com.pateandoapp.pateandobackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;

/**
 * Classe de serviço responsável pelas regras de negócio relacionadas a
 * Usuários.
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Criar Usuario
    public Usuario createUser(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Buscar todos os Usuarios
    public List<Usuario> listUsers() {
        return usuarioRepository.findAll();
    }

    // Buscar usuário por ID
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    // Buscar usuário por email
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    // Deletar usuário
    public void deleteUser(Long id) {
        usuarioRepository.deleteById(id);
    }
}
