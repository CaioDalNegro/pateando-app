package br.com.pateandoapp.pateandobackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.pateandoapp.pateandobackend.model.Pet;
import br.com.pateandoapp.pateandobackend.service.PetService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


/**
 * Controller responsável pelos endpoints de Pets.
 */
@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "*") // Permite requisições do app React Native
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
}
