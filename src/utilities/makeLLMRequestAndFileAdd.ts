import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export default async function makeLLMRequestAndFileAdd(prompt: string, folderPath: string, fileName: string, language: string) {
  const messages = [
    vscode.LanguageModelChatMessage.User(prompt)
  ];
  const model = await vscode.lm.selectChatModels({
    vendor: 'copilot'
  });
  const response = await model[0].sendRequest(messages);

  let responseText = "";
  for await (const fragment of response.text) {
    responseText += fragment;
  }

  responseText = responseText.split("```")[1];
  responseText = responseText.split(language+"\n")[1];

  

  const filePath = path.join(folderPath, fileName);

  
  fs.writeFile(filePath, responseText, (err) => {
    if (err) {
      console.error('Error writing to file', err);
      throw new Error("Error file creation");
    } else {
      console.log('File has been written successfully');
    }
  });

}