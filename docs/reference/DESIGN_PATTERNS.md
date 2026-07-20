# Guia de Referência: Padrões de Projeto (Design Patterns)

Este guia serve como base conceitual e prática para a aplicação de soluções consolidadas para problemas recorrentes no desenvolvimento de software orientada a objetos (GOF - Gang of Four).

---

## 1. Padrões Criacionais (Creational Patterns)
Focam no processo de criação de objetos, abstraindo a lógica de instanciação e tornando o sistema independente de como seus objetos são criados, compostos e representados.

### Factory Method
* **Intenção:** Define uma interface para criar um objeto, mas deixa as subclasses decidirem qual classe instanciar.
* **Estrutura de Aplicação:** Utilizar quando o código não deve conhecer a classe exata e dependências dos objetos com os quais precisa operar.
* **Regra de Design:** Depender de abstrações e não de implementações concretas (DIP).

### Abstract Factory
* **Intenção:** Permite produzir famílias de objetos relacionados ou dependentes sem especificar suas classes concretas.
* **Estrutura de Aplicação:** Fornece interfaces para criação de cada componente de uma suite/família de produtos.

### Builder
* **Intenção:** Permite a construção de objetos complexos passo a passo. O padrão permite produzir diferentes tipos e representações de um objeto usando o mesmo código de construção.
* **Estrutura de Aplicação:** Utilizar para construção de entidades de domínio complexas com múltiplos parâmetros opcionais ou configurações ricas.

### Singleton
* **Intenção:** Garante que uma classe tenha apenas uma instância e fornece um ponto de acesso global a ela.
* **Aviso de Arquitetura:** Usar com extrema cautela, pois introduz estado global oculto e pode dificultar testes unitários. Preferir injeção de dependência via container.

---

## 2. Padrões Estruturais (Structural Patterns)
Focam em como classes e objetos são compostos para formar estruturas maiores, garantindo que as partes do sistema permaneçam flexíveis e eficientes.

### Adapter
* **Intenção:** Permite que objetos com interfaces incompatíveis colaborem entre si.
* **Estrutura de Aplicação:** Essencial na Arquitetura Limpa para converter os dados dos Repositories/Gateways externos para o formato exigido pelas entidades ou casos de uso da aplicação.

### Composite
* **Intenção:** Permite compor objetos em estruturas de árvore para representar hierarquias partes-todo. Permite que clientes tratem objetos individuais e composições de objetos de maneira uniforme.

### Decorator
* **Intenção:** Permite adicionar novos comportamentos a objetos dinamicamente, colocando-os dentro de objetos envoltórios (wrappers) que contêm esses comportamentos.
* **Estrutura de Aplicação:** Adicionar responsabilidades como *caching*, log, ou validação cross-cutting sem modificar as classes de regra de negócio originais.

### Facade
* **Intenção:** Fornece uma interface unificada para um conjunto de interfaces em um subsistema. Define uma interface de nível mais alto que torna o subsistema mais fácil de usar.
* **Estrutura de Aplicação:** Simplificar a interação do domínio com subsistemas legados complexos ou bibliotecas externas de terceiros.

### Proxy
* **Intenção:** Fornece um substituto ou marcador de posição para outro objeto para controlar o acesso a ele, atrasar sua criação ou realizar auditorias de segurança.

---

## 3. Padrões Comportamentais (Behavioral Patterns)
Focam nos algoritmos, na atribuição de responsabilidades entre objetos e em como eles se comunicam.

### Chain of Responsibility
* **Intenção:** Permite passar solicitações ao longo de uma cadeia de manipuladores. Ao receber uma solicitação, cada manipulador decide se processa a solicitação ou a passa para o próximo manipulador na cadeia.

### Command
* **Intenção:** Transforma uma solicitação em um objeto autônomo que contém todas as informações sobre a solicitação. Essa transformação permite parametrizar métodos com diferentes solicitações.

### Iterator
* **Intenção:** Permite percorrer elementos de uma coleção sem expor sua representação subjacente (lista, pilha, árvore, etc.).

### Mediator
* **Intenção:** Permite reduzir as dependências caóticas entre objetos. O padrão restringe as comunicações diretas entre os objetos e os força a colaborar apenas através de um objeto mediador.
* **Estrutura de Aplicação:** Comum na camada de Application para desacoplar handlers de eventos e controllers (ex: biblioteca MediatR ou padrões de Event Bus internos).

### Observer
* **Intenção:** Define um mecanismo de assinatura para notificar múltiplos objetos sobre quaisquer eventos que aconteçam com o objeto que eles estão observando.
* **Estrutura de Aplicação:** Disparo de eventos de domínio (Domain Events) após a execução bem-sucedida de um Caso de Uso.

### State
* **Intenção:** Permite que um objeto altere seu comportamento quando seu estado interno muda. O objeto parecerá ter mudado de classe.
* **Estrutura de Aplicação:** Ideal para modelar fluxos de ciclo de vida complexos dentro de Entidades de Domínio (ex: status de um pedido, aprovações de folhas de ponto).

### Strategy
* **Intenção:** Define uma família de algoritmos, encapsula cada um deles e os torna intercambiáveis. Permite que o algoritmo varie independentemente dos clientes que o utilizam.
* **Estrutura de Aplicação:** Regras de cálculo variáveis (como regras de horas extras, adicionais de folha de pagamento, impostos) injetadas dinamicamente conforme o contexto.

### Template Method
* **Intenção:** Define o esqueleto de um algoritmo na superclasse, mas deixa as subclasses sobrescreverem etapas específicas do algoritmo sem modificar sua estrutura estrutural.

---

## Checklist de Aplicação nos Projetos
1.  **Evite Overengineering:** Não force padrões onde um design simples resolve. Aplique padrões quando houver variação legítima ou complexidade de manutenção.
2.  **Casamento com Princípios:** Use Padrões Criacionais junto ao OCP (Open-Closed Principle) para estender sistemas sem modificar o código existente.
3.  **Desacoplamento de Infraestrutura:** Use *Adapters* e *Strategies* para isolar o domínio das escolhas tecnológicas mutáveis.