package br.com.pateandoapp.pateandobackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import br.com.pateandoapp.pateandobackend.model.Pet;
import br.com.pateandoapp.pateandobackend.service.PetService;

@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "*")
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping("/user/{usuarioId}")
    public List<Pet> getPetsByUsuario(@PathVariable Long usuarioId) {
        return petService.getPetsByUsuario(usuarioId);
    }

    @PostMapping("/create/{usuarioId}")
    public Pet createPet(@PathVariable Long usuarioId, @RequestBody Pet pet) {
        return petService.createPet(usuarioId, pet)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    // NOVO — Remover pet
    @DeleteMapping("/delete/{petId}")
    public String deletePet(@PathVariable Long petId) {
        boolean removed = petService.deletePet(petId);

        if (removed) {
            return "Pet removido com sucesso!";
        } else {
            return "Pet não encontrado!";
        }
    }
}