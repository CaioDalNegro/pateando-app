package br.com.pateandoapp.pateandobackend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.pateandoapp.pateandobackend.model.Dogwalker;
import br.com.pateandoapp.pateandobackend.model.Usuario;
import br.com.pateandoapp.pateandobackend.repository.DogwalkerRepository;
import br.com.pateandoapp.pateandobackend.repository.UsuarioRepository;

/**
 * Classe de serviço responsável pelas regras de negócio relacionadas a Dogwalkers.
 */
@Service
public class DogwalkerService {

    @Autowired
    private DogwalkerRepository dogwalkerRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Cria um novo Dogwalker a partir de um usuário existente
     */
    public Dogwalker criarDogwalker(Long usuarioId, String disponibilidade) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        // Verificar se já existe um dogwalker para este usuário
        if (dogwalkerRepository.findByUsuarioId(usuarioId).isPresent()) {
            throw new RuntimeException("Este usuário já é um Dogwalker!");
        }

        // Verificar se o usuário é do tipo DOGWALKER
        if (!"DOGWALKER".equalsIgnoreCase(usuario.getTipo())) {
            throw new RuntimeException("Este usuário não é do tipo DOGWALKER!");
        }

        Dogwalker dogwalker = new Dogwalker();
        dogwalker.setUsuario(usuario);
        dogwalker.setDisponibilidade(disponibilidade != null ? disponibilidade : "DISPONIVEL");

        return dogwalkerRepository.save(dogwalker);
    }

    /**
     * Lista todos os dogwalkers
     */
    public List<Dogwalker> listarTodos() {
        return dogwalkerRepository.findAll();
    }

    /**
     * Lista dogwalkers disponíveis
     * ✅ CORRIGIDO: Retorna todos mas cada um com sua disponibilidade real
     */
    public List<Dogwalker> listarDisponiveis() {
        // Retornar TODOS os dogwalkers - o frontend vai mostrar quem está disponível ou não
        // Isso permite que o cliente veja todos os dogwalkers e seus status
        return dogwalkerRepository.findAll();
    }

    /**
     * Lista APENAS dogwalkers com status DISPONIVEL
     */
    public List<Dogwalker> listarApenasDisponiveis() {
        return dogwalkerRepository.findByDisponibilidadeIgnoreCase("DISPONIVEL");
    }

    /**
     * Busca dogwalker por ID
     */
    public Optional<Dogwalker> buscarPorId(Long id) {
        return dogwalkerRepository.findById(id);
    }

    /**
     * Busca dogwalker pelo ID do usuário
     */
    public Optional<Dogwalker> buscarPorUsuarioId(Long usuarioId) {
        return dogwalkerRepository.findByUsuarioId(usuarioId);
    }

    /**
     * Atualiza disponibilidade do dogwalker
     */
    public Dogwalker atualizarDisponibilidade(Long dogwalkerId, String disponibilidade) {
        Dogwalker dogwalker = dogwalkerRepository.findById(dogwalkerId)
                .orElseThrow(() -> new RuntimeException("Dogwalker não encontrado!"));

        dogwalker.setDisponibilidade(disponibilidade);
        return dogwalkerRepository.save(dogwalker);
    }

    /**
     * Atualiza disponibilidade pelo ID do usuário
     * Se o dogwalker não existir, cria um novo
     */
    public Dogwalker atualizarDisponibilidadePorUsuarioId(Long usuarioId, String disponibilidade) {
        Optional<Dogwalker> dogwalkerOpt = dogwalkerRepository.findByUsuarioId(usuarioId);
        
        if (dogwalkerOpt.isPresent()) {
            Dogwalker dogwalker = dogwalkerOpt.get();
            dogwalker.setDisponibilidade(disponibilidade);
            return dogwalkerRepository.save(dogwalker);
        } else {
            // Criar dogwalker se não existir
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
            
            if (!"DOGWALKER".equalsIgnoreCase(usuario.getTipo())) {
                throw new RuntimeException("Este usuário não é do tipo DOGWALKER!");
            }
            
            Dogwalker novoDogwalker = new Dogwalker();
            novoDogwalker.setUsuario(usuario);
            novoDogwalker.setDisponibilidade(disponibilidade);
            novoDogwalker.setPreco30min(25.0);
            novoDogwalker.setPreco60min(40.0);
            novoDogwalker.setPreco90min(55.0);
            novoDogwalker.setAvaliacaoMedia(5.0);
            novoDogwalker.setTotalPasseios(0);
            return dogwalkerRepository.save(novoDogwalker);
        }
    }

    /**
     * Deleta um dogwalker
     */
    public void deletar(Long id) {
        dogwalkerRepository.deleteById(id);
    }
}