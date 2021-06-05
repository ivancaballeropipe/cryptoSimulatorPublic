-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-06-2021 a las 19:17:06
-- Versión del servidor: 10.4.14-MariaDB
-- Versión de PHP: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `crypto_simulator`
--

DELIMITER $$
--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `insertarUsuario` (`nombre` VARCHAR(20), `correo` VARCHAR(100), `password` VARCHAR(50)) RETURNS VARCHAR(20) CHARSET utf8 COLLATE utf8_spanish_ci BEGIN
	DECLARE cod_usuario VARCHAR(20);
	INSERT INTO secuencia_usuarios VALUES (NULL);
	SET cod_usuario = CONCAT('USU-', LPAD(LAST_INSERT_ID(), 6, '0'));
    INSERT INTO `usuarios`(`cod_usuario`, `nombre`, `correo`, `password`) VALUES (cod_usuario, nombre, correo, password);
	RETURN cod_usuario;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cartera`
--

CREATE TABLE `cartera` (
  `cod_cartera` int(11) NOT NULL,
  `cod_moneda` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `cod_usuario` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `num_tokens` float NOT NULL DEFAULT 0,
  `capital` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `cartera`
--

INSERT INTO `cartera` (`cod_cartera`, `cod_moneda`, `cod_usuario`, `num_tokens`, `capital`) VALUES
(1, 'bitcoin', 'USU-000001', 0, 0),
(2, 'cardano', 'USU-000001', 0, 0),
(3, 'chiliz', 'USU-000001', 44.5573, 10),
(4, 'dogecoin', 'USU-000001', 65.1718, 22),
(5, 'ethereum', 'USU-000001', 0, 0),
(6, 'vechain', 'USU-000001', 456.204, 50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `monedas`
--

CREATE TABLE `monedas` (
  `cod_moneda` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `nombre` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `decimales` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `monedas`
--

INSERT INTO `monedas` (`cod_moneda`, `nombre`, `decimales`) VALUES
('bitcoin', 'Bit Coin', 2),
('cardano', 'Cardano', 4),
('chiliz', 'Chiliz', 5),
('dogecoin', 'Doge Coin', 5),
('ethereum', 'Ethereum', 2),
('vechain', 'VeChain', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimentos`
--

CREATE TABLE `movimentos` (
  `cod_movimiento` int(11) NOT NULL,
  `cod_usuario` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `cod_moneda` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `tipo` enum('compra','venta') COLLATE utf8_spanish_ci NOT NULL,
  `capital` float NOT NULL,
  `num_tokens` float NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `movimentos`
--

INSERT INTO `movimentos` (`cod_movimiento`, `cod_usuario`, `cod_moneda`, `tipo`, `capital`, `num_tokens`, `fecha`) VALUES
(1, 'USU-000001', 'dogecoin', 'compra', 1, 3.58976, '2021-05-25 20:12:55'),
(2, 'USU-000001', 'dogecoin', 'compra', 1, 3.56303, '2021-05-25 20:52:15'),
(3, 'USU-000001', 'dogecoin', 'compra', 1, 3.61076, '2021-05-25 21:52:26'),
(4, 'USU-000001', 'dogecoin', 'compra', 1, 3.61076, '2021-05-25 21:53:20'),
(5, 'USU-000001', 'dogecoin', 'compra', 1, 3.61076, '2021-05-25 21:54:01'),
(6, 'USU-000001', 'dogecoin', 'compra', 1, 3.68256, '2021-05-25 22:08:35'),
(7, 'USU-000001', 'dogecoin', 'compra', 1, 3.68256, '2021-05-25 22:08:43'),
(8, 'USU-000001', 'dogecoin', 'compra', 7.66976, 28, '2021-05-25 22:49:43'),
(9, 'USU-000001', 'dogecoin', 'venta', 15.3395, 56, '2021-05-25 22:50:21'),
(10, 'USU-000001', 'dogecoin', 'venta', 0.257474, 0.93996, '2021-05-25 22:50:36'),
(11, 'USU-000001', 'dogecoin', 'compra', 1, 3.63875, '2021-05-25 22:54:29'),
(12, 'USU-000001', 'dogecoin', 'venta', 1, 3.63875, '2021-05-25 22:54:57'),
(13, 'USU-000001', 'dogecoin', 'venta', 0.27482, 1, '2021-05-25 22:56:11'),
(14, 'USU-000001', 'dogecoin', 'compra', 1, 3.54359, '2021-05-26 19:36:39'),
(15, 'USU-000001', 'dogecoin', 'venta', 1.00099, 3.54359, '2021-05-26 19:39:47'),
(16, 'USU-000001', 'dogecoin', 'compra', 1, 3.5412, '2021-05-26 23:00:17'),
(17, 'USU-000001', 'chiliz', 'compra', 10, 44.5573, '2021-06-01 20:11:39'),
(18, 'USU-000001', 'dogecoin', 'compra', 25, 74.5823, '2021-06-02 22:36:02'),
(19, 'USU-000001', 'vechain', 'compra', 50, 456.204, '2021-06-04 18:56:28'),
(20, 'USU-000001', 'dogecoin', 'venta', 1, 3.23792, '2021-06-05 18:34:25'),
(21, 'USU-000001', 'dogecoin', 'venta', 1, 3.23792, '2021-06-05 18:39:04'),
(22, 'USU-000001', 'dogecoin', 'venta', 2, 6.47585, '2021-06-05 18:39:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `saldo`
--

CREATE TABLE `saldo` (
  `cod_saldo` int(11) NOT NULL,
  `cod_usuario` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `saldo` float NOT NULL,
  `invertido` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `saldo`
--

INSERT INTO `saldo` (`cod_saldo`, `cod_usuario`, `saldo`, `invertido`) VALUES
(1, 'USU-000001', 110, 195);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secuencia_usuarios`
--

CREATE TABLE `secuencia_usuarios` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `secuencia_usuarios`
--

INSERT INTO `secuencia_usuarios` (`id`) VALUES
(1),
(2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `cod_usuario` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `nombre` varchar(20) COLLATE utf8_spanish_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8_spanish_ci NOT NULL,
  `password` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `fecha_alta` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`cod_usuario`, `nombre`, `correo`, `password`, `fecha_alta`) VALUES
('USU-000001', 'Ivanaa', 'hitvan95@gmail.com', 'Iviivi1995', '2021-05-20 22:24:12');

--
-- Disparadores `usuarios`
--
DELIMITER $$
CREATE TRIGGER `alta_usuario` BEFORE INSERT ON `usuarios` FOR EACH ROW BEGIN
  INSERT INTO secuencia_usuarios VALUES (NULL);
  SET NEW.cod_usuario = CONCAT('USU-', LPAD(LAST_INSERT_ID(), 6, '0'));
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cartera`
--
ALTER TABLE `cartera`
  ADD PRIMARY KEY (`cod_cartera`);

--
-- Indices de la tabla `monedas`
--
ALTER TABLE `monedas`
  ADD PRIMARY KEY (`cod_moneda`);

--
-- Indices de la tabla `movimentos`
--
ALTER TABLE `movimentos`
  ADD PRIMARY KEY (`cod_movimiento`);

--
-- Indices de la tabla `saldo`
--
ALTER TABLE `saldo`
  ADD PRIMARY KEY (`cod_saldo`);

--
-- Indices de la tabla `secuencia_usuarios`
--
ALTER TABLE `secuencia_usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`cod_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cartera`
--
ALTER TABLE `cartera`
  MODIFY `cod_cartera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `movimentos`
--
ALTER TABLE `movimentos`
  MODIFY `cod_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `saldo`
--
ALTER TABLE `saldo`
  MODIFY `cod_saldo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `secuencia_usuarios`
--
ALTER TABLE `secuencia_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
