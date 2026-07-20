# Guia de Referência: Clean Architecture (Robert C. Martin)

Este guia consolida os princípios, regras de dependência e limites arquiteturais propostos por Robert C. Martin ("Uncle Bob") no livro *Arquitetura Limpa: O Guia do Artesão para Estrutura e Design de Software*.

---

## 1. O Princípio Fundamental: A Regra de Dependência
> **"As dependências de código-fonte devem apontar apenas para dentro, na direção dos códigos de alto nível (políticas de negócio)."**

Nada em um círculo interno pode saber algo sobre algo em um círculo externo. Nomes de formatos de dados, bancos de dados, frameworks ou UI declarados em um círculo externo não devem ser mencionados pelo código em um círculo interno.

---

## 2. As Camadas do Sistema

### 1ª Camada: Entidades (Entities / Domain Core)
* **O que contém:** Objetos de negócio e regras corporativas mais gerais e de alto nível. Encapsula os dados e os comportamentos centrais.
* **Regra de Ouro:** Não conhecem banco de dados, frameworks, UI ou ferramentas de rede. São puras. Mudanças em detalhes externos (como migrar de ORM ou banco de dados) nunca afetam essa camada.
* **Componentes:** Entities, Value Objects, Domain Services, Domain Exceptions.

### 2ª Camada: Casos de Uso (Use Cases / Application Business Rules)
* **O que contém:** Regras de negócio específicas da aplicação. Orquestra o fluxo de dados vindos e direcionados para as entidades, direcionando-as para alcançar os objetivos do caso de uso.
* **Regra de Ouro:** Isolada de mudanças na UI ou de escolhas de persistência. Contém interfaces (Ports/Abstrações) para os dados necessários.
* **Componentes:** Use Case Interactors, Input Ports (DTOs de entrada), Output Ports (Interfaces de Repositories/Gateways, DTOs de saída).

### 3ª Camada: Adaptadores de Interface (Interface Adapters / Presenters / Controllers)
* **O que contém:** Tradutores de dados. Converte os dados no formato mais conveniente para os casos de uso e entidades, para o formato mais conveniente para agentes externos (como Web, BD, Dispositivos).
* **Regra de Ouro:** É onde ficam os controladores de APIs, presenters de UI, e as implementações abstratas de acesso a dados (Mappers, Query Builders).
* **Componentes:** Controllers (REST/GraphQL), Presenters, ViewModels, Gateways, DB Repositories Concretos.

### 4ª Camada: Frameworks e Drivers (Frameworks & Drivers / Infrastructure)
* **O que contém:** Onde residem os detalhes técnicos. O banco de dados (PostgreSQL, Supabase), a interface do usuário (Flutter, HTML/CSS), a biblioteca de rotas, ferramentas de terceiros.
* **Regra de Ouro:** Contém apenas código de colagem (*glue code*) para interligar a infraestrutura aos adaptadores. Deve ser tratada como um mero plug-in do sistema.
* **Componentes:** Configurações de Bancos de Dados, Drivers de Redes, Inicializadores de Frameworks, UI Widgets.

---

## 3. Princípios de Design Componentizados (SOLID aplicado à Arquitetura)

* **SRP (Single Responsibility Principle):** Um módulo deve ter apenas uma razão para mudar (deve responder a apenas um ator). Separe o cálculo de negócio do mecanismo de exibição/armazenamento.
* **OCP (Open-Closed Principle):** Um artefato de software deve estar aberto para extensão, mas fechado para modificação. Conseguido dividindo o sistema em componentes e ordenando as dependências de forma que as mudanças nos componentes de baixo nível (ex: UI) não alterem os de alto nível (ex: Domínio).
* **LSP (Liskov Substitution Principle):** As subclasses/implementações devem ser intercambiáveis pelas suas classes base/interfaces sem quebrar o comportamento esperado do sistema.
* **ISP (Interface Segregation Principle):** Evite depender de módulos que contenham métodos não utilizados. Crie interfaces granulares e focadas no cliente (ex: não faça um repositório gigantesco se o caso de uso só precisa ler uma linha).
* **DIP (Dependency Inversion Principle):** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. (Mecanismo usado para fazer a infraestrutura obedecer ao Domínio).

---

## 4. Cruzando as Fronteiras (Polimorfismo e DTOs)
1.  **Inversão de Controle:** Quando um Caso de Uso precisa chamar o Banco de Dados (Infraestrutura), ele define uma Interface (Output Port) na camada de Caso de Uso. A camada de Infraestrutura implementa essa interface. Assim, o fluxo de controle vai para fora, mas a dependência de código aponta para dentro.
2.  **Isolamento de Dados (DTOs):** Os dados que cruzam os limites das camadas devem ser estruturas simples de dados (Data Transfer Objects). Nunca passe entidades de domínio ou registros/modelos de banco de dados diretos (como objetos ORM) através das fronteiras.

---

## Diretrizes de Execução Estrutural
Ao criar ou reestruturar arquivos, garanta:
1.  **Independência de Framework:** O núcleo do software não deve depender de recursos de bibliotecas de terceiros.
2.  **Testabilidade:** As regras de negócio devem ser testáveis sem a presença de UI, Banco de Dados, Servidores Web ou qualquer elemento externo.
3.  **Independência da UI:** A UI pode mudar facilmente sem alterar o resto do sistema.
4.  **Independência do Banco de Dados:** Você pode trocar o mecanismo de persistência por outro sem tocar em uma única linha de regras de negócio.