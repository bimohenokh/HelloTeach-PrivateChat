// import { useState, useEffect, useRef } from 'react';
// import Guru from './Guru';
// import guru from "./Guru";
//
// const gurus = [{
//     nama: "Budi",
//     mapel: "Matematika",
//     harga: 100000,
//     jam: 2,
//     alamat: "Jl. Sudirman",
//     nohp: "08123456789",
// }, {
//     nama: "Andi",
//     mapel: "Fisika",
//     harga: 150000,
//     jam: 2,
//     alamat: "Jl. Sudirman",
//     nohp: "08123456789",
// }, {
//     nama: "Caca",
//     mapel: "Kimia",
//     harga: 200000,
//     jam: 2,
//     alamat: "Jl. Sudirman",
//     nohp: "08123456789",
// }]
//
//
// const DaftarGuru = ({props}) => {
//     return (
//         <div className='channel-list'>
//             <div className="channel-type">
//                 <h1>Group Channels</h1>
//                 <button className="channel-create-button" onClick={() => handleLoadMemberSelectionList()}>Create Channel</button>
//             </div>
//             {channels.map(channel => {
//                 return (
//                     <div key={channel.url} className="channel-list-item" >
//                         <div
//                             className="channel-list-item-name"
//                             onClick={() => { handleJoinChannel(channel.url) }}>
//                             <ChannelName members={channel.members} />
//                             <div className="last-message">{channel.lastMessage?.message}</div>
//                         </div>
//                         <div>
//                             <button className="control-button" onClick={() => handleDeleteChannel(channel.url)}>
//                                 <img className="channel-icon" src='/icon_delete.png' />
//                             </button>
//                         </div>
//                     </div>
//                 );
//             })}
//         </div >);
// }
//
// const Guru = (props) => {
//     return <div className="guru">
//         <div className="nama">{props.nama}</div>
//         <div className="mapel">{props.mapel}</div>
//         <div className="harga">{props.harga}</div>
//         <div className="jam">{props.jam}</div>
//         <div className="alamat">{props.alamat}</div>
//         <div className="nohp">{props.nohp}</div>
//     </div>
// }
//
// export default DaftarGuru;