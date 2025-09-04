package br.com.pateandoapp.pateandobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.pateandoapp.pateandobackend.model.Dogwalker;

/**
 * Repositório da entidade Dogwalker.
 */
public interface DogwalkerRepository extends JpaRepository<Dogwalker, Long> {
    
}
