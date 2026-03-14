export interface Noticia {
  id: number;
  titulo: string;
  resumo: string;
  conteudo?: string;
  data: string;
  categoria: string;
  imagem: string;
  destaque?: boolean;
}

export const NOTICIAS: Noticia[] = [
  {
    id: 1,
    titulo: 'Tempo chuvoso: entregas podem sofrer atrasos',
    resumo: 'Devido às condições meteorológicas da época chuvosa nas regiões centro e norte, as rotas podem estar afectadas.',
    conteudo: 'Devido às condições meteorológicas da época chuvosa nas regiões centro e norte de Moçambique, as rotas podem estar afectadas por inundações, derrocadas ou estradas em mau estado. A Lirandzo monitoriza todas as viagens em tempo real e mantém contacto permanente com motoristas e clientes.\n\nPedimos compreensão durante este período e reforçamos o nosso compromisso em minimizar impactos. Em caso de atrasos significativos, a nossa equipa de suporte entra em contacto atempadamente.\n\nPara questões urgentes sobre uma entrega em curso, contacte-nos através dos canais habituais.',
    data: '2025-03-10',
    categoria: 'Aviso',
    imagem: '/images/news-1.jpg',
    destaque: true
  },
  {
    id: 2,
    titulo: 'Nova frota: 5 camiões adicionados à operação',
    resumo: 'Investimos na ampliação da frota própria para responder ao aumento da procura e garantir maior flexibilidade.',
    conteudo: 'A Lirandzo investiu na ampliação da frota própria com a aquisição de 5 novos camiões. Esta expansão permite responder ao aumento da procura e garantir maior flexibilidade de horários e rotas.\n\nOs novos veículos já estão equipados com rastreamento GPS 24/7 e cumprem todos os requisitos de segurança e conformidade. A nossa equipa de manutenção acompanha cada unidade para garantir operações sem interrupções.\n\nCom esta ampliação, reforçamos a nossa capacidade no corredor Joanesburgo–Maputo e nas rotas nacionais.',
    data: '2025-03-05',
    categoria: 'Operações',
    imagem: '/images/hero-truck-1.jpg'
  },
  {
    id: 3,
    titulo: 'Rastreio em tempo real para todos os clientes',
    resumo: 'A plataforma de rastreio foi actualizada. Receba notificações por SMS e e-mail em cada etapa da entrega.',
    conteudo: 'A nossa plataforma de rastreio foi completamente actualizada. Agora todos os clientes podem acompanhar as suas cargas em tempo real através do painel web ou da aplicação móvel.\n\nReceba notificações automáticas por SMS e e-mail em cada etapa da entrega — da recolha ao destino final. O sistema mostra a localização GPS actualizada e estimativas de chegada.\n\nPara aceder ao rastreio, basta ter o código da sua encomenda. Se ainda não recebeu o código, contacte a nossa equipa de suporte.',
    data: '2025-02-28',
    categoria: 'Tecnologia',
    imagem: '/images/news-2.jpg'
  },
  {
    id: 4,
    titulo: 'Rotas Maputo–Joanesburgo com frequência semanal',
    resumo: 'Expandimos a rede internacional com cargas gerais e contentorizadas entre Moçambique e África do Sul.',
    conteudo: 'Expandimos a nossa rede internacional com frequência semanal para cargas gerais e contentorizadas entre Maputo e Joanesburgo. O corredor ZA–MZ está agora mais acessível para empresas de todos os portes.\n\nTratamos de toda a documentação aduaneira e garantimos monitorização em tempo real em cada viagem. Consulte a disponibilidade para as suas necessidades específicas através do formulário de cotação ou contactando a nossa equipa comercial.',
    data: '2025-02-20',
    categoria: 'Rotas',
    imagem: '/images/hero-truck-2.jpg'
  },
  {
    id: 5,
    titulo: 'Parceria com armazéns em Nacala e Beira',
    resumo: 'Novos pontos de consolidação no norte do país permitem reduzir tempos de trânsito e custos.',
    conteudo: 'Estabelecemos parcerias com armazéns estratégicos em Nacala e Beira, criando novos pontos de consolidação para cargas com destino ao norte de Moçambique.\n\nEstes hubs permitem reduzir tempos de trânsito e custos operacionais, além de oferecer maior flexibilidade em termos de janelas de entrega. As instalações dispõem de segurança 24h e controlo de stock digital.\n\nPara cargas com destino a Nampula, Cabo Delgado ou Niassa, consulte-nos para optimizar a sua logística.',
    data: '2025-02-12',
    categoria: 'Infraestrutura',
    imagem: '/images/about-warehouse.jpg'
  },
  {
    id: 6,
    titulo: 'Lirandzo certificada ISO 9001:2015',
    resumo: 'Conquistámos a certificação de qualidade, reforçando o compromisso com processos padronizados.',
    conteudo: 'A Lirandzo conquistou a certificação ISO 9001:2015, reforçando o nosso compromisso com processos padronizados e melhoria contínua em toda a operação.\n\nEsta certificação atesta a implementação de um sistema de gestão da qualidade que abrange desde a recolha até à entrega, incluindo documentação, formação da equipa e monitorização de indicadores.\n\nPara os nossos clientes, isto significa maior consistência, previsibilidade e confiança em cada entrega.',
    data: '2025-02-05',
    categoria: 'Qualidade',
    imagem: '/images/news-3.jpg'
  }
];
