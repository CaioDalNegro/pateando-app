package br.com.pateandoapp.pateandobackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.pateandoapp.pateandobackend.model.Dogwalker;
import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.repository.DogwalkerRepository;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DogwalkerRepository dogwalkerRepository;

    // Criar Usuario
    public Usuario createUser(Usuario usuario) {
        // Verificar se email já existe
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado!");
        }

        // Verificar se telefone já existe
        if (usuarioRepository.findByTelefone(usuario.getTelefone()).isPresent()) {
            throw new RuntimeException("Telefone já cadastrado!");
        }

        // Salvar o usuário
        Usuario savedUser = usuarioRepository.save(usuario);

        // Se for DOGWALKER, criar automaticamente o registro na tabela dogwalkers
        if ("DOGWALKER".equalsIgnoreCase(usuario.getTipo())) {
            Dogwalker dogwalker = new Dogwalker();
            dogwalker.setUsuario(savedUser);
            dogwalker.setDisponibilidade("DISPONIVEL");
            dogwalker.setPreco30min(25.0);
            dogwalker.setPreco60min(40.0);
            dogwalker.setPreco90min(55.0);
            dogwalker.setAvaliacaoMedia(5.0);
            dogwalker.setTotalPasseios(0);
            dogwalkerRepository.save(dogwalker);
        }

        return savedUser;
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

    public Optional<Usuario> login(String email, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndSenha(email, senha);
        
        // Se o login for bem-sucedido e for um DOGWALKER, garantir que existe o registro
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if ("DOGWALKER".equalsIgnoreCase(usuario.getTipo())) {
                // Verificar se já existe registro de dogwalker
                if (dogwalkerRepository.findByUsuarioId(usuario.getId()).isEmpty()) {
                    // Criar registro de dogwalker se não existir
                    Dogwalker dogwalker = new Dogwalker();
                    dogwalker.setUsuario(usuario);
                    dogwalker.setDisponibilidade("DISPONIVEL");
                    dogwalker.setPreco30min(25.0);
                    dogwalker.setPreco60min(40.0);
                    dogwalker.setPreco90min(55.0);
                    dogwalker.setAvaliacaoMedia(5.0);
                    dogwalker.setTotalPasseios(0);
                    dogwalkerRepository.save(dogwalker);
                }
            }
        }
        
        return usuarioOpt;
    }
}