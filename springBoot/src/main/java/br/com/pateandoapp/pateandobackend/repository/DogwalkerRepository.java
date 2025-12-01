package br.com.pateandoapp.pateandobackend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.pateandoapp.pateandobackend.model.Dogwalker;

/**
 * Repositório da entidade Dogwalker.
 */
public interface DogwalkerRepository extends JpaRepository<Dogwalker, Long> {
    
    // Busca dogwalker pelo ID do usuário associado
    Optional<Dogwalker> findByUsuarioId(Long usuarioId);
    
    // Busca dogwalkers por disponibilidade
    List<Dogwalker> findByDisponibilidade(String disponibilidade);
    
    // Busca todos os dogwalkers disponíveis
    List<Dogwalker> findByDisponibilidadeIgnoreCase(String disponibilidade);
}