package br.com.pateandoapp.pateandobackend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.pateandoapp.pateandobackend.model.Agendamento;
import br.com.pateandoapp.pateandobackend.service.AgendamentoService;

@RestController
@RequestMapping("/agendamentos")
@CrossOrigin(origins = "*")
public class AgendamentoController {

    @Autowired
    private AgendamentoService agendamentoService;

    /**
     * POST /agendamentos/criar
     * ✅ ATUALIZADO: Aceita múltiplos pets
     * Body: { clienteId, petIds: [1,2,3], dogwalkerId, dataHora, duracao, rota?, observacoes? }
     * Também aceita formato antigo: { clienteId, petId, dogwalkerId, ... }
     */
    @PostMapping("/criar")
    public ResponseEntity<?> criarAgendamento(@RequestBody Map<String, Object> dados) {
        try {
            Long clienteId = Long.valueOf(dados.get("clienteId").toString());
            Long dogwalkerId = Long.valueOf(dados.get("dogwalkerId").toString());

            // ✅ Suporte para múltiplos pets (petIds) ou único pet (petId)
            List<Long> petIds = new ArrayList<>();
            
            if (dados.get("petIds") != null) {
                // Novo formato: array de IDs
                @SuppressWarnings("unchecked")
                List<?> rawPetIds = (List<?>) dados.get("petIds");
                for (Object id : rawPetIds) {
                    petIds.add(Long.valueOf(id.toString()));
                }
            } else if (dados.get("petId") != null) {
                // Formato antigo: único ID (compatibilidade)
                petIds.add(Long.valueOf(dados.get("petId").toString()));
            } else {
                return ResponseEntity.badRequest().body("É necessário informar petId ou petIds!");
            }

            // Validar máximo de 3 pets
            if (petIds.size() > 3) {
                return ResponseEntity.badRequest().body("Máximo de 3 pets por passeio!");
            }

            Agendamento agendamentoData = new Agendamento();
            
            // Parse da data/hora (formato ISO)
            String dataHoraStr = dados.get("dataHora").toString();
            agendamentoData.setDataHora(java.time.LocalDateTime.parse(dataHoraStr));
            
            agendamentoData.setDuracao(Integer.valueOf(dados.get("duracao").toString()));
            
            if (dados.get("rota") != null) {
                agendamentoData.setRota(dados.get("rota").toString());
            }
            if (dados.get("observacoes") != null) {
                agendamentoData.setObservacoes(dados.get("observacoes").toString());
            }

            Agendamento salvo = agendamentoService.criarAgendamento(clienteId, petIds, dogwalkerId, agendamentoData);
            return ResponseEntity.ok(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /agendamentos
     * Lista todos os agendamentos
     */
    @GetMapping
    public ResponseEntity<List<Agendamento>> listarTodos() {
        return ResponseEntity.ok(agendamentoService.listarTodos());
    }

    /**
     * GET /agendamentos/{id}
     * Busca agendamento por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        return agendamentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /agendamentos/cliente/{clienteId}
     * Lista agendamentos de um cliente
     */
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<?> listarPorCliente(@PathVariable Long clienteId) {
        try {
            List<Agendamento> agendamentos = agendamentoService.listarPorCliente(clienteId);
            return ResponseEntity.ok(agendamentos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /agendamentos/dogwalker/{dogwalkerId}
     * Lista agendamentos de um dogwalker (pelo ID do dogwalker)
     */
    @GetMapping("/dogwalker/{dogwalkerId}")
    public ResponseEntity<?> listarPorDogwalker(@PathVariable Long dogwalkerId) {
        try {
            List<Agendamento> agendamentos = agendamentoService.listarPorDogwalker(dogwalkerId);
            return ResponseEntity.ok(agendamentos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /agendamentos/dogwalker/usuario/{usuarioId}
     * Lista agendamentos de um dogwalker pelo ID do usuário
     */
    @GetMapping("/dogwalker/usuario/{usuarioId}")
    public ResponseEntity<?> listarPorDogwalkerUsuarioId(@PathVariable Long usuarioId) {
        try {
            List<Agendamento> agendamentos = agendamentoService.listarPorDogwalkerUsuarioId(usuarioId);
            return ResponseEntity.ok(agendamentos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /agendamentos/status/{status}
     * Lista agendamentos por status (PENDENTE, ACEITO, REJEITADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Agendamento>> listarPorStatus(@PathVariable String status) {
        return ResponseEntity.ok(agendamentoService.listarPorStatus(status));
    }

    /**
     * PUT /agendamentos/{id}/aceitar
     * Dogwalker aceita um agendamento
     * Body: { dogwalkerUsuarioId }
     */
    @PutMapping("/{id}/aceitar")
    public ResponseEntity<?> aceitarAgendamento(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long dogwalkerUsuarioId = body.get("dogwalkerUsuarioId");
            Agendamento agendamento = agendamentoService.aceitarAgendamento(id, dogwalkerUsuarioId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /agendamentos/{id}/rejeitar
     * Dogwalker rejeita um agendamento
     * Body: { dogwalkerUsuarioId }
     */
    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<?> rejeitarAgendamento(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long dogwalkerUsuarioId = body.get("dogwalkerUsuarioId");
            Agendamento agendamento = agendamentoService.rejeitarAgendamento(id, dogwalkerUsuarioId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /agendamentos/{id}/iniciar
     * Dogwalker inicia o passeio
     * Body: { dogwalkerUsuarioId }
     */
    @PutMapping("/{id}/iniciar")
    public ResponseEntity<?> iniciarPasseio(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long dogwalkerUsuarioId = body.get("dogwalkerUsuarioId");
            Agendamento agendamento = agendamentoService.iniciarPasseio(id, dogwalkerUsuarioId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /agendamentos/{id}/finalizar
     * Dogwalker finaliza o passeio
     * Body: { dogwalkerUsuarioId }
     */
    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarPasseio(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long dogwalkerUsuarioId = body.get("dogwalkerUsuarioId");
            Agendamento agendamento = agendamentoService.finalizarPasseio(id, dogwalkerUsuarioId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /agendamentos/{id}/cancelar
     * Cliente cancela um agendamento
     * Body: { clienteId }
     */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarAgendamento(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long clienteId = body.get("clienteId");
            Agendamento agendamento = agendamentoService.cancelarAgendamento(id, clienteId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /agendamentos/{id}/emergencia
     * Cliente solicita parada de emergência
     * Body: { clienteId }
     */
    @PutMapping("/{id}/emergencia")
    public ResponseEntity<?> solicitarEmergencia(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long clienteId = body.get("clienteId");
            Agendamento agendamento = agendamentoService.solicitarEmergencia(id, clienteId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /agendamentos/{id}/emergencia/confirmar
     * Dogwalker confirma recebimento da emergência
     * Body: { dogwalkerUsuarioId }
     */
    @PutMapping("/{id}/emergencia/confirmar")
    public ResponseEntity<?> confirmarEmergencia(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long dogwalkerUsuarioId = body.get("dogwalkerUsuarioId");
            Agendamento agendamento = agendamentoService.confirmarEmergencia(id, dogwalkerUsuarioId);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * DELETE /agendamentos/{id}
     * Deleta um agendamento
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id) {
        agendamentoService.deletarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
}