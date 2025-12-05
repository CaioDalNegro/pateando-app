package br.com.pateandoapp.pateandobackend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.pateandoapp.pateandobackend.model.Agendamento;
import br.com.pateandoapp.pateandobackend.model.Dogwalker;
import br.com.pateandoapp.pateandobackend.model.Pet;
import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.repository.AgendamentoRepository;
import br.com.pateandoapp.pateandobackend.repository.DogwalkerRepository;
import br.com.pateandoapp.pateandobackend.repository.PetRepository;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;

@Service
public class AgendamentoService {

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private DogwalkerRepository dogwalkerRepository;

    /**
     * ✅ ATUALIZADO: Cria um novo agendamento com múltiplos pets (até 3)
     */
    public Agendamento criarAgendamento(Long clienteId, List<Long> petIds, Long dogwalkerId, Agendamento agendamentoData) {
        // Validar quantidade de pets
        if (petIds == null || petIds.isEmpty()) {
            throw new RuntimeException("Selecione pelo menos um pet!");
        }
        if (petIds.size() > 3) {
            throw new RuntimeException("Máximo de 3 pets por passeio!");
        }

        // Buscar o cliente
        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        // Verificar se é realmente um cliente
        if (!"CLIENTE".equalsIgnoreCase(cliente.getTipo())) {
            throw new RuntimeException("Usuário não é um cliente!");
        }

        // Buscar e validar todos os pets
        List<Pet> pets = new ArrayList<>();
        for (Long petId : petIds) {
            Pet pet = petRepository.findById(petId)
                    .orElseThrow(() -> new RuntimeException("Pet com ID " + petId + " não encontrado!"));

            // Verificar se o pet pertence ao cliente
            if (!pet.getDono().getId().equals(clienteId)) {
                throw new RuntimeException("O pet " + pet.getNome() + " não pertence ao cliente!");
            }

            pets.add(pet);
        }

        // Buscar o dogwalker
        Dogwalker dogwalker = dogwalkerRepository.findById(dogwalkerId)
                .orElseThrow(() -> new RuntimeException("Dogwalker não encontrado!"));

        // Montar o agendamento
        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setPets(pets);
        agendamento.setDogwalker(dogwalker);
        agendamento.setDataHora(agendamentoData.getDataHora());
        agendamento.setDuracao(agendamentoData.getDuracao());
        agendamento.setRota(agendamentoData.getRota());
        agendamento.setObservacoes(agendamentoData.getObservacoes());
        agendamento.setStatus("PENDENTE");

        return agendamentoRepository.save(agendamento);
    }

    /**
     * ✅ Método de compatibilidade para criar com um único pet
     */
    public Agendamento criarAgendamento(Long clienteId, Long petId, Long dogwalkerId, Agendamento agendamentoData) {
        List<Long> petIds = new ArrayList<>();
        petIds.add(petId);
        return criarAgendamento(clienteId, petIds, dogwalkerId, agendamentoData);
    }

    /**
     * Lista todos os agendamentos
     */
    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    /**
     * Busca agendamento por ID
     */
    public Optional<Agendamento> buscarPorId(Long id) {
        return agendamentoRepository.findById(id);
    }

    /**
     * Lista agendamentos de um cliente específico
     */
    public List<Agendamento> listarPorCliente(Long clienteId) {
        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));
        return agendamentoRepository.findByCliente(cliente);
    }

    /**
     * Lista agendamentos de um dogwalker específico
     */
    public List<Agendamento> listarPorDogwalker(Long dogwalkerId) {
        Dogwalker dogwalker = dogwalkerRepository.findById(dogwalkerId)
                .orElseThrow(() -> new RuntimeException("Dogwalker não encontrado!"));
        return agendamentoRepository.findByDogwalker(dogwalker);
    }

    /**
     * Lista agendamentos de um dogwalker pelo ID do usuário
     */
    public List<Agendamento> listarPorDogwalkerUsuarioId(Long usuarioId) {
        Optional<Dogwalker> dogwalkerOpt = dogwalkerRepository.findByUsuarioId(usuarioId);
        if (dogwalkerOpt.isEmpty()) {
            return List.of();
        }
        return agendamentoRepository.findByDogwalker(dogwalkerOpt.get());
    }

    /**
     * Lista agendamentos por status
     */
    public List<Agendamento> listarPorStatus(String status) {
        return agendamentoRepository.findByStatus(status.toUpperCase());
    }

    /**
     * Dogwalker aceita um agendamento
     */
    public Agendamento aceitarAgendamento(Long agendamentoId, Long dogwalkerUsuarioId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para aceitar este agendamento!");
        }

        if (!"PENDENTE".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Este agendamento não está mais pendente!");
        }

        agendamento.setStatus("ACEITO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Dogwalker rejeita um agendamento
     */
    public Agendamento rejeitarAgendamento(Long agendamentoId, Long dogwalkerUsuarioId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para rejeitar este agendamento!");
        }

        if (!"PENDENTE".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Este agendamento não está mais pendente!");
        }

        agendamento.setStatus("REJEITADO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Inicia um passeio (muda status para EM_ANDAMENTO e dogwalker fica OCUPADO)
     */
    public Agendamento iniciarPasseio(Long agendamentoId, Long dogwalkerUsuarioId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para iniciar este passeio!");
        }

        if (!"ACEITO".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Este agendamento precisa estar aceito para iniciar!");
        }

        // Atualizar disponibilidade do dogwalker para OCUPADO
        Dogwalker dogwalker = agendamento.getDogwalker();
        dogwalker.setDisponibilidade("OCUPADO");
        dogwalkerRepository.save(dogwalker);

        agendamento.setStatus("EM_ANDAMENTO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Finaliza um passeio (incrementa contador e volta disponibilidade)
     */
    public Agendamento finalizarPasseio(Long agendamentoId, Long dogwalkerUsuarioId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para finalizar este passeio!");
        }

        if (!"EM_ANDAMENTO".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Este passeio não está em andamento!");
        }

        // Incrementar contador de passeios do dogwalker
        Dogwalker dogwalker = agendamento.getDogwalker();
        Integer totalAtual = dogwalker.getTotalPasseios();
        if (totalAtual == null) totalAtual = 0;
        dogwalker.setTotalPasseios(totalAtual + 1);
        
        // Voltar disponibilidade para DISPONIVEL
        dogwalker.setDisponibilidade("DISPONIVEL");
        dogwalkerRepository.save(dogwalker);

        agendamento.setStatus("CONCLUIDO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Cliente cancela um agendamento
     */
    public Agendamento cancelarAgendamento(Long agendamentoId, Long clienteId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("Você não tem permissão para cancelar este agendamento!");
        }

        if ("EM_ANDAMENTO".equalsIgnoreCase(agendamento.getStatus()) || 
            "CONCLUIDO".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Não é possível cancelar um passeio em andamento ou concluído!");
        }

        agendamento.setStatus("CANCELADO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Cliente solicita parada de emergência
     */
    public Agendamento solicitarEmergencia(Long agendamentoId, Long clienteId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("Você não tem permissão para solicitar emergência neste agendamento!");
        }

        if (!"EM_ANDAMENTO".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Só é possível solicitar emergência em passeios em andamento!");
        }

        agendamento.setEmergenciaAtiva(true);
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Dogwalker confirma recebimento da emergência e finaliza o passeio
     */
    public Agendamento confirmarEmergencia(Long agendamentoId, Long dogwalkerUsuarioId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para confirmar esta emergência!");
        }

        // Desativar emergência e finalizar passeio
        agendamento.setEmergenciaAtiva(false);
        agendamento.setStatus("CONCLUIDO");
        
        // Voltar disponibilidade do dogwalker
        Dogwalker dogwalker = agendamento.getDogwalker();
        dogwalker.setDisponibilidade("DISPONIVEL");
        dogwalkerRepository.save(dogwalker);

        return agendamentoRepository.save(agendamento);
    }

    /**
     * Deleta um agendamento (admin)
     */
    public void deletarAgendamento(Long id) {
        agendamentoRepository.deleteById(id);
    }
}