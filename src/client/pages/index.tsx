import * as React from 'react';
import styled from 'styled-components';
import { A } from '../components/a';
import { Title } from '../components/title';
import { SubTitle } from '../components/sub-title';

const IndexRoot = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 100px auto 100px auto auto;
  grid-template-areas: 
    ". . ."
    ". header ."
    ". . ."
    ". download .";
`;

const Header = styled.div`
  grid-area: header;
  text-align: center;
`;

const Download = styled.div`
  grid-area: download;
  text-align: center;
`;


export const Index = () => {

  return <IndexRoot id="index">

    <Header>
      <Title>YOMI</Title>
      <SubTitle>Real time, peer to peer esports betting</SubTitle>
    </Header>

    <Download>

      <A href="https://play.google.com/store/apps/details?id=com.tolerated.tadasstankevicius.tourbet">
        Available now for Android
      </A>

    </Download>

  </IndexRoot>;

}