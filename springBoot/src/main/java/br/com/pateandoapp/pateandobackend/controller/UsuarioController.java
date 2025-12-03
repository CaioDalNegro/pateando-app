package br.com.pateandoapp.pateandobackend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.pateandoapp.pateandobackend.model.Agendamento;
import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.service.AgendamentoService;
import br.com.pateandoapp.pateandobackend.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    
    @Autowired
    private AgendamentoService agendamentoService;

    // Injeção via construtor (boa prática)
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // POST - Criar novo usuário
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Usuario usuario) {
        try {
            Usuario salvo = usuarioService.createUser(usuario);
            return ResponseEntity.ok(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET - Listar todos os usuários
    @GetMapping
    public ResponseEntity<List<Usuario>> listAllUsers() {
        return ResponseEntity.ok(usuarioService.listUsers());
    }

    // GET - Buscar usuário por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> findById(@PathVariable Long id) {
        return usuarioService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Remover usuário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        usuarioService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // POST - Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> user) {
        String email = user.get("email");
        String senha = user.get("senha");

        Optional<Usuario> usuario = usuarioService.login(email, senha);

        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        } else {
            return ResponseEntity.status(401).body("Email ou senha inválidos!");
        }
    }

    /**
     * GET - Estatísticas do cliente
     * Retorna: totalPasseios, horasFormatadas, dogwalkerFavorito
     */
    @GetMapping("/{id}/estatisticas")
    public ResponseEntity<?> getEstatisticas(@PathVariable Long id) {
        try {
            // Verificar se o usuário existe
            Optional<Usuario> usuarioOpt = usuarioService.findById(id);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Buscar todos os agendamentos CONCLUÍDOS do cliente
            List<Agendamento> agendamentos = agendamentoService.listarPorCliente(id);
            List<Agendamento> concluidos = agendamentos.stream()
                    .filter(a -> "CONCLUIDO".equalsIgnoreCase(a.getStatus()))
                    .toList();

            // Calcular total de passeios
            int totalPasseios = concluidos.size();

            // Calcular total de minutos
            int totalMinutos = concluidos.stream()
                    .mapToInt(Agendamento::getDuracao)
                    .sum();

            // Formatar horas
            String horasFormatadas = formatarHoras(totalMinutos);

            // Encontrar dogwalker favorito (quem fez mais passeios)
            String dogwalkerFavorito = "Nenhum";
            int passeiosComFavorito = 0;

            if (!concluidos.isEmpty()) {
                // Contar passeios por dogwalker
                Map<String, Integer> contagemPorDogwalker = new HashMap<>();
                Map<String, String> nomesDogwalkers = new HashMap<>();

                for (Agendamento ag : concluidos) {
                    if (ag.getDogwalker() != null && ag.getDogwalker().getUsuario() != null) {
                        String dwId = ag.getDogwalker().getId().toString();
                        String dwNome = ag.getDogwalker().getUsuario().getNome();
                        
                        contagemPorDogwalker.merge(dwId, 1, Integer::sum);
                        nomesDogwalkers.put(dwId, dwNome);
                    }
                }

                // Encontrar o favorito
                String favoritoId = null;
                int maxPasseios = 0;
                for (Map.Entry<String, Integer> entry : contagemPorDogwalker.entrySet()) {
                    if (entry.getValue() > maxPasseios) {
                        maxPasseios = entry.getValue();
                        favoritoId = entry.getKey();
                    }
                }

                if (favoritoId != null) {
                    String nomeCompleto = nomesDogwalkers.get(favoritoId);
                    // Pegar só o primeiro nome + inicial do sobrenome
                    dogwalkerFavorito = formatarNome(nomeCompleto);
                    passeiosComFavorito = maxPasseios;
                }
            }

            // Montar resposta
            Map<String, Object> estatisticas = new HashMap<>();
            estatisticas.put("totalPasseios", totalPasseios);
            estatisticas.put("totalMinutos", totalMinutos);
            estatisticas.put("horasFormatadas", horasFormatadas);
            estatisticas.put("dogwalkerFavorito", dogwalkerFavorito);
            estatisticas.put("passeiosComFavorito", passeiosComFavorito);

            return ResponseEntity.ok(estatisticas);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao buscar estatísticas: " + e.getMessage());
        }
    }

    // Formata minutos em horas (ex: 150 min -> "2h30")
    private String formatarHoras(int minutos) {
        if (minutos == 0) return "0h";
        int horas = minutos / 60;
        int mins = minutos % 60;
        if (mins == 0) return horas + "h";
        if (horas == 0) return mins + "min";
        return horas + "h" + mins;
    }

    // Formata nome para "Nome S." (primeiro nome + inicial do sobrenome)
    private String formatarNome(String nomeCompleto) {
        if (nomeCompleto == null || nomeCompleto.isBlank()) return "Desconhecido";
        
        String[] partes = nomeCompleto.trim().split("\\s+");
        if (partes.length == 1) {
            return partes[0];
        }
        
        String primeiroNome = partes[0];
        String inicialSobrenome = partes[partes.length - 1].substring(0, 1).toUpperCase() + ".";
        
        return primeiroNome + " " + inicialSobrenome;
    }
}