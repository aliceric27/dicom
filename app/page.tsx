"use client";
import Image from 'next/image'
import Button from '@mui/material/Button';
import { useState,useEffect,useRef } from 'react';
import * as dicomParser from 'dicom-parser';

export default function Home() {
  const [patientName, setPatientName] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [patientAge, setPatientAge] = useState<string | null>(null);
  const [patientSex, setPatientSex] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  function parseDicom(arrayBuffer: any) {

    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet:any = dicomParser.parseDicom(byteArray);
    setPatientName(dataSet.string('x00100010'));
    setBirthDate(dataSet.string('x00100030'));
    setPatientAge(dataSet.string('x00101010'));  // DICOM標籤為病患年齡
    setPatientSex(dataSet.string('x00100040'));
    const width = dataSet.uint16('x00280010'); // Rows
    const height = dataSet.uint16('x00280011'); // Columns
    const bitsAllocated = dataSet.uint16('x00280100'); // Bits Allocated (e.g., 8, 16)
    // 從dataSet提取像素數據
    const pixelDataElement = dataSet.elements.x7fe00010;
    const pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);

    // 使用canvas來轉換像素數據為Base64圖像URL
   const canvas:{} = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);
    if (bitsAllocated === 8) {
      for (let i = 0; i < pixelData.length; i++) {
          imageData.data[4 * i] = pixelData[i];      // R
          imageData.data[4 * i + 1] = pixelData[i];  // G
          imageData.data[4 * i + 2] = pixelData[i];  // B
          imageData.data[4 * i + 3] = 255;           // A
      }
  }
  context.putImageData(imageData, 0, 0);
  const base64Image = canvas.toDataURL();
  setSelectedImage(base64Image);
  }

  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
        reader.onload = function(event:any) {
            parseDicom(event.target.result);
        }
        reader.readAsArrayBuffer(file);
    }
    }
  
    const canvasRef = useRef(null);

  return (
    <>
      <div className='grid grid-cols-4 h-screen'>
        <div className='bg-red-500 h-full col-span-3 p-10'>
          <input 
            type="file" 
            accept=".dcm" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
            id="upload-input"
          />
          <label htmlFor="upload-input">
            <Button component="span" className="my-3" variant="contained">
              Upload
            </Button>
          </label>
          <div>
            <p>Patient Name:{patientName}</p>
            <p>Birthday:{birthDate}</p>
            <p>Age:{patientAge}</p>
            <p>Sex:{patientSex}</p>
            <div style={{position: 'relative'}}>
            <div className='my-5 bg-slate-500 max-h-[400px] w-full'>
            {selectedImage && <Image width={400} height={400} src={selectedImage} alt="Uploaded Preview" objectFit="contain" />}
            </div>
            </div>
          </div>
        </div>
        <div className='bg-blue-500 h-full p-10'>
          <p>Label Tools</p>
          <Button className="my-3" variant="contained">Add</Button>
          <div>
            <p>Label List</p>
            <ul>
              <li>label1 </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
  }