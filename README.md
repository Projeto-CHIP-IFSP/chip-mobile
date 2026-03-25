# 📱 Projeto CHIP | Mobile App

> Repositório oficial do Aplicativo Hub/Standalone do ecossistema CHIP. Desenvolvido para o 3º semestre de Ciência da Computação (IFSP).

## 📖 Sobre o Projeto CHIP
O CHIP é um ecossistema de assistência ao estudo focado em produtividade e bem-estar digital. O diferencial do projeto é a hibridez: o sistema opera tanto como um robô físico de companhia (IoT) quanto como um aplicativo autônomo (Mobile), unificados por uma inteligência artificial compartilhada e gamificação.

## 🎯 O que este repositório faz?
Este repositório contém o código fonte do aplicativo.
**Responsabilidades da Squad:**
* **Modo Standalone:** Utiliza a câmera frontal do celular para realizar a detecção de foco/emoção (rodando o TFLite gerado pela Squad 1).
* **Modo Hub:** Visualização de estatísticas, histórico de sessões e evolução na gamificação.
* **Conexão:** Integração com Firebase para banco de dados em nuvem.

## 👥 A Equipe (Squad 3 - Mobile)
* Gabriel Ferreira 
* Gustavo Ferreira 
* Sabrina Lima 
* Yasmin Sampieri 

## 🛠️ Stack Tecnológica
* **Framework:** React Native (Expo) 
* **Linguagem:** JavaScript / TypeScript 
* **BaaS:** Firebase 

## 🚦 Padrões de Desenvolvimento (Git & Jira)
Para manter nosso código limpo e integrado com o Jira, siga estas regras:

1. **Nunca faça commits direto na `main`.** Todo código deve vir de um Pull Request.
2. **Nomenclatura de Branches:** Use o código da tarefa do Jira + um breve descritivo.
   * *Exemplo:* `feat/SCRUM-8-tela-dashboard` ou `fix/SCRUM-15-crash-ios`
3. **Nomenclatura de Commits:** Use *Conventional Commits*.
   * `feat: cria tela de login`
   * `fix: ajusta margem no componente de gráfico`
   * `chore: atualiza pacotes do expo`
