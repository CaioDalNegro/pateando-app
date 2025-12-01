package br.com.pateandoapp.pateandobackend.service;

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
     * Cria um novo agendamento
     */
    public Agendamento criarAgendamento(Long clienteId, Long petId, Long dogwalkerId, Agendamento agendamentoData) {
        // Buscar o cliente
        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        // Verificar se é realmente um cliente
        if (!"CLIENTE".equalsIgnoreCase(cliente.getTipo())) {
            throw new RuntimeException("Usuário não é um cliente!");
        }

        // Buscar o pet
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet não encontrado!"));

        // Verificar se o pet pertence ao cliente
        if (!pet.getDono().getId().equals(clienteId)) {
            throw new RuntimeException("Este pet não pertence ao cliente!");
        }

        // Buscar o dogwalker
        Dogwalker dogwalker = dogwalkerRepository.findById(dogwalkerId)
                .orElseThrow(() -> new RuntimeException("Dogwalker não encontrado!"));

        // Montar o agendamento
        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setPet(pet);
        agendamento.setDogwalker(dogwalker);
        agendamento.setDataHora(agendamentoData.getDataHora());
        agendamento.setDuracao(agendamentoData.getDuracao());
        agendamento.setRota(agendamentoData.getRota());
        agendamento.setObservacoes(agendamentoData.getObservacoes());
        agendamento.setStatus("PENDENTE");

        return agendamentoRepository.save(agendamento);
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
        Dogwalker dogwalker = dogwalkerRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Dogwalker não encontrado para este usuário!"));
        return agendamentoRepository.findByDogwalker(dogwalker);
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

        // Verificar se o dogwalker é o correto
        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para aceitar este agendamento!");
        }

        // Verificar se está pendente
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

        // Verificar se o dogwalker é o correto
        if (!agendamento.getDogwalker().getUsuario().getId().equals(dogwalkerUsuarioId)) {
            throw new RuntimeException("Você não tem permissão para rejeitar este agendamento!");
        }

        // Verificar se está pendente
        if (!"PENDENTE".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Este agendamento não está mais pendente!");
        }

        agendamento.setStatus("REJEITADO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Inicia um passeio (muda status para EM_ANDAMENTO)
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

        agendamento.setStatus("EM_ANDAMENTO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Finaliza um passeio
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

        agendamento.setStatus("CONCLUIDO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Cliente cancela um agendamento
     */
    public Agendamento cancelarAgendamento(Long agendamentoId, Long clienteId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado!"));

        // Verificar se é o cliente correto
        if (!agendamento.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("Você não tem permissão para cancelar este agendamento!");
        }

        // Só pode cancelar se ainda não iniciou
        if ("EM_ANDAMENTO".equalsIgnoreCase(agendamento.getStatus()) || 
            "CONCLUIDO".equalsIgnoreCase(agendamento.getStatus())) {
            throw new RuntimeException("Não é possível cancelar um passeio em andamento ou concluído!");
        }

        agendamento.setStatus("CANCELADO");
        return agendamentoRepository.save(agendamento);
    }

    /**
     * Deleta um agendamento (admin)
     */
    public void deletarAgendamento(Long id) {
        agendamentoRepository.deleteById(id);
    }
}