package br.com.pateandoapp.pateandobackend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.pateandoapp.pateandobackend.model.Pet;
import br.com.pateandoapp.pateandobackend.repository.PetRepository;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;

/**
 * Classe de serviço responsável pelas regras de negócio relacionadas aos Pets.
 */
@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Optional<Pet> createPet(Long usuarioId, Pet pet) {
        return usuarioRepository.findById(usuarioId).map(usuario -> {
            pet.setDono(usuario);
            return petRepository.save(pet);
        });
    }    
}
