package br.com.pateandoapp.pateandobackend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.pateandoapp.pateandobackend.model.Dogwalker;
import br.com.pateandoapp.pateandobackend.service.DogwalkerService;

/**
 * Controller responsável pelos endpoints de Dogwalker.
 */
@RestController
@RequestMapping("/dogwalkers")
@CrossOrigin(origins = "*")
public class DogwalkerController {

    @Autowired
    private DogwalkerService dogwalkerService;

    /**
     * POST /dogwalkers/criar
     * Cria um novo Dogwalker vinculado a um usuário
     * Body: { usuarioId, disponibilidade? }
     */
    @PostMapping("/criar")
    public ResponseEntity<?> criarDogwalker(@RequestBody Map<String, Object> dados) {
        try {
            Long usuarioId = Long.valueOf(dados.get("usuarioId").toString());
            String disponibilidade = dados.get("disponibilidade") != null 
                    ? dados.get("disponibilidade").toString() 
                    : "DISPONIVEL";

            Dogwalker dogwalker = dogwalkerService.criarDogwalker(usuarioId, disponibilidade);
            return ResponseEntity.ok(dogwalker);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /dogwalkers
     * Lista todos os dogwalkers
     */
    @GetMapping
    public ResponseEntity<List<Dogwalker>> listarTodos() {
        return ResponseEntity.ok(dogwalkerService.listarTodos());
    }

    /**
     * GET /dogwalkers/disponiveis
     * Lista apenas dogwalkers disponíveis
     */
    @GetMapping("/disponiveis")
    public ResponseEntity<List<Dogwalker>> listarDisponiveis() {
        return ResponseEntity.ok(dogwalkerService.listarDisponiveis());
    }

    /**
     * GET /dogwalkers/{id}
     * Busca dogwalker por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        return dogwalkerService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /dogwalkers/usuario/{usuarioId}
     * Busca dogwalker pelo ID do usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> buscarPorUsuarioId(@PathVariable Long usuarioId) {
        return dogwalkerService.buscarPorUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /dogwalkers/{id}/disponibilidade
     * Atualiza a disponibilidade de um dogwalker
     * Body: { disponibilidade: "DISPONIVEL" | "INDISPONIVEL" }
     */
    @PutMapping("/{id}/disponibilidade")
    public ResponseEntity<?> atualizarDisponibilidade(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        try {
            String disponibilidade = body.get("disponibilidade");
            Dogwalker dogwalker = dogwalkerService.atualizarDisponibilidade(id, disponibilidade);
            return ResponseEntity.ok(dogwalker);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /dogwalkers/usuario/{usuarioId}/disponibilidade
     * Atualiza a disponibilidade pelo ID do usuário
     * Body: { disponibilidade: "DISPONIVEL" | "INDISPONIVEL" }
     */
    @PutMapping("/usuario/{usuarioId}/disponibilidade")
    public ResponseEntity<?> atualizarDisponibilidadePorUsuarioId(
            @PathVariable Long usuarioId, 
            @RequestBody Map<String, String> body) {
        try {
            String disponibilidade = body.get("disponibilidade");
            Dogwalker dogwalker = dogwalkerService.atualizarDisponibilidadePorUsuarioId(usuarioId, disponibilidade);
            return ResponseEntity.ok(dogwalker);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * DELETE /dogwalkers/{id}
     * Deleta um dogwalker
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        dogwalkerService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}