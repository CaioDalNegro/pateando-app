package br.com.pateandoapp.pateandobackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.pateandoapp.pateandobackend.model.Agendamento;
import br.com.pateandoapp.pateandobackend.model.Dogwalker;
import br.com.pateandoapp.pateandobackend.model.Usuario;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    // Buscar agendamentos de um cliente
    List<Agendamento> findByCliente(Usuario cliente);

    // Buscar agendamentos de um Dogwalker
    List<Agendamento> findByDogwalker(Dogwalker dogwalker);

    // Buscar agendamentos por status
    List<Agendamento> findByStatus(String status);
}
