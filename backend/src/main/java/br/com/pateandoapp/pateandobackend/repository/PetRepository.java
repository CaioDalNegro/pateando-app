package br.com.pateandoapp.pateandobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.pateandoapp.pateandobackend.model.Pet;

/**
 * Repositório da entidade Pet.
 */
public interface PetRepository extends JpaRepository<Pet, Long> {
    
}
