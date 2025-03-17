"use client";
import { useState } from "react";

import openaiClient, {
  splitTextIntoChunks,
  translateDocument,
} from "../src/translate";
import CopyButton from "../component/buttons";
import { SplittedChunksQuestionMark } from "../component/tooltip";
import {
  GeistProvider,
  CssBaseline,
  Grid,
  Card,
  Button,
  Textarea,
  Spacer,
  Text,
  Input,
  Loading,
} from "@geist-ui/core";

// const markdown = `
// ### Operating Results, Fact and Fiction

// Let’s begin with the numbers. The official annual report begins on K-1 and extends for 124 pages. It is filled with a vast amount of information – some important, some trivial.

// Among its disclosures, many owners, along with financial reporters, will focus on page K-72. There, they will find the proverbial “bottom line” labeled “Net earnings (loss).” The numbers read $90 billion for 2021, ($23 billion) for 2022, and $96 billion for 2023.
// `;

const markdown = `
### Operating Results, Fact and Fiction

Let’s begin with the numbers. The official annual report begins on K-1 and extends for 124 pages. It is filled with a vast amount of information – some important, some trivial.  

Among its disclosures, many owners, along with financial reporters, will focus on page K-72. There, they will find the proverbial “bottom line” labeled “Net earnings (loss).” The numbers read $90 billion for 2021, ($23 billion) for 2022, and $96 billion for 2023.  

What in the world is going on?  

You seek guidance and are told that the procedures for calculating these “earnings” are promulgated by a sober and credentialed Financial Accounting Standards Board (“FASB”), mandated by a dedicated and hard-working Securities and Exchange Commission (“SEC”), and audited by the world-class professionals at Deloitte & Touche (“D&T”). On page K-67, D&T pulls no punches:  

> “In our opinion, the financial statements . . . present fairly, in all material respects (italics mine), the financial position of the Company . . . and the results of its operations . . . for each of the three years in the period ended December 31, 2023 . . .”  

So sanctified, this worse-than-useless “net income” figure quickly gets transmitted throughout the world via the internet and media. All parties believe they have done their job – and, legally, they have.  

We, however, are left uncomfortable. At Berkshire, our view is that “earnings” should be a sensible concept that Bertie will find somewhat useful – but only as a starting point – in evaluating a business. Accordingly, Berkshire also reports to Bertie and you what we call “operating earnings.” Here is the story they tell:  

- $27.6 billion for 2021  

- $30.9 billion for 2022  

- $37.4 billion for 2023 `;
export default function Home() {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  // const [textInput, setTextInput] = useState("");
  const [splitted, setSplitted] = useState([]);
  const [translatedText, setTranslatedText] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  const updateApiKey = (event) => {
    openaiClient.apiKey = event.target.value;
  };
  // const handleTextInput = (event) => {
  //   setTextInput(event.target.value);
  // };

  const handleSplit = (event) => {
    const chunks = splitTextIntoChunks(event.target.value);
    setSplitted(chunks); //
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const response = await translateDocument(splitted); // 使用服務端翻譯邏輯
      setTranslatedText(response.translations); // 設置翻譯結果
      setTotalCost(response.totalCost); // 設置總費用
      setTotalTokens(response.totalTokens); // 設置總使用的 token 數量
    } catch (error) {
      console.error("翻譯失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(translatedText)
      .then(() => {
        alert("Copied!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <GeistProvider>
      <CssBaseline />
      <div className="flex items-center justify-center">
        <Card className="border-none">
          <Text h1>Long document translater</Text>
          <div className="flex items-center justify-center">
            <form>
              <Text
                p
                id="apikey-input"
                className="block items-center justify-center"
              >
                Paste Your Key and Start
              </Text>
              <Input
                // className="rounded-full border border-solid transition-colors flex items-center justify-center"
                clearable
                id="apikey-input"
                placeholder="Your OpenAI API Key"
                onChange={updateApiKey}
              />
            </form>
          </div>
        </Card>
      </div>

      {/* <a
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        onClick={handleTranslate}
        target="_blank"
        rel="noopener noreferrer"
        disabled={loading}
      >
        {loading ? "Working hard ..." : "Translate"}
      </a> */}
      <Spacer />
      <Spacer />
      <Spacer />
      <Spacer />
      <Grid.Container gap={2} justify="center">
        <Grid xs={6}>
          <Text h4> 1. Paste document</Text>
        </Grid>
        <Grid xs={6}>
          <Text h4> 2. Check splitted chunks </Text>
        </Grid>
        <Grid xs={2}></Grid>
        <Grid xs={6}>
          <div className="flex">
            <Text h4> 3. Translation result</Text>
            <CopyButton text={translatedText} />
          </div>
        </Grid>
      </Grid.Container>
      <Grid.Container gap={2} justify="center" height="60vh">
        <Grid xs={6}>
          <Card shadow width="100%" className="relative">
            <Textarea
              height="100%"
              width="100%"
              className="absolute top-0 left-0 m-0 p-0 overflow-auto"
              placeholder="Paste text/markdown from pdf or website. The markdown format will be saved."
              onChange={handleSplit}
            />
          </Card>
        </Grid>
        {/* <Grid xs={2}>
          <div className="flex w-full items-center">
            <Button shadow width="100%" type="secondary" onClick={handleSplit}>
              Split
            </Button>
          </div>
        </Grid> */}
        <Grid xs={6}>
          <Card shadow height="100%" width="100%" className="relative">
            <Textarea
              disabled
              height="100%"
              width="100%"
              className="absolute top-0 left-0 m-0 p-0 overflow-auto"
              placeholder={splitted
                .map((chunk, i) => `${i + 1}:\n${chunk} \r\n\r\n`)
                .join("")}
            />
          </Card>
        </Grid>
        <Grid xs={2}>
          <div className="flex w-full items-center">
            <Button
              shadow
              width="100%"
              type="secondary"
              onClick={handleTranslate}
            >
              {loading ? "Working..." : "Translate"}
            </Button>
          </div>
        </Grid>
        <Grid xs={6}>
          <Card
            id="translation-result"
            shadow
            height="100%"
            width="100%"
            className="relative overflow-auto h-40"
          >
            {translatedText}
          </Card>
        </Grid>
      </Grid.Container>
      <Spacer />
      <div className="text-right pr-7">
        <Text p className>
          Total token used: {totalTokens}
        </Text>
        <Text p>Predicted Cost: {totalCost.toFixed(3)}</Text>
      </div>
    </GeistProvider>
  );
}
