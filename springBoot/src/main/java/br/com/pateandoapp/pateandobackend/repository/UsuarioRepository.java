package br.com.pateandoapp.pateandobackend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.pateandoapp.pateandobackend.model.Usuario;

/**
 * Repositório da entidade Usuario.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByTelefone(String telefone);

    boolean existsByEmail(String email);
}
