package br.com.pateandoapp.pateandobackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.pateandoapp.pateandobackend.model.Pet;
import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.repository.PetRepository;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Optional<Pet> createPet(Long usuarioId, Pet pet) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            pet.setDono(usuario);
            Pet novoPet = petRepository.save(pet);
            return Optional.of(novoPet);
        }
        return Optional.empty();
    }

    public List<Pet> getPetsByUsuario(Long usuarioId) {
        return petRepository.findByDonoId(usuarioId);
    }

    // NOVO — remover pet
    public boolean deletePet(Long petId) {
        if (petRepository.existsById(petId)) {
            petRepository.deleteById(petId);
            return true;
        }
        return false;
    }
}